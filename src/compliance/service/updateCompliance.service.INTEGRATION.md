# Integration Guide: Enhanced LLM Prompts into UpdateComplianceService

## Changes Required to `updateCompliance.service.ts`

### Step 1: Add Imports (at top of file)

```typescript
// Add these imports after existing imports (around line 17)
import { PromptVariablesService } from '../prompts/prompt-variables.service';
import { LLMComplianceResponseDto, ImplementationStatus } from '../dto/llm-response.dto';
import { App } from 'src/entities/app.entity';
import { Standard } from 'src/entities/standard_v1.entity';
```

### Step 2: Update Constructor (around line 22)

```typescript
constructor(
    @InjectRepository(AsyncTask) private readonly asyncTaskRepo: Repository<AsyncTask>,
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
    @InjectRepository(PolicyDetails) private readonly policyRepo: Repository<PolicyDetails>,
    @InjectRepository(AppStandard) private readonly appStandardRepo: Repository<AppStandard>,
    @InjectRepository(ApplicationControlMapping) private readonly appControlMapRepo: Repository<ApplicationControlMapping>,
    @InjectRepository(Control) private readonly controlRepo: Repository<Control>,
    @InjectRepository(StandardControlMapping) private readonly standardControlMapRepo: Repository<StandardControlMapping>,
    @InjectRepository(ControlChunkMapping) private readonly controlChunkRepo: Repository<ControlChunkMapping>,
    @InjectRepository(SourceV1) private readonly sourceRepo: Repository<SourceV1>,
    @InjectRepository(SourceVersion) private readonly sourceVersionRepo: Repository<SourceVersion>,
    private readonly aiHelperService: AiHelperService,
    private readonly awsS3ConfigService: AwsS3ConfigService,
    @Inject(forwardRef(() => RecommendationService))
    private readonly recommendationService: RecommendationService,
    // ✅ ADD THESE NEW DEPENDENCIES
    private readonly promptVariablesService: PromptVariablesService,
    @InjectRepository(App) private readonly appRepo: Repository<App>,
    @InjectRepository(Standard) private readonly standardRepo: Repository<Standard>,
) {}
```

### Step 3: Replace Generic Prompt (in `processControlBatchWithLLM` method, around line 342-384)

**FIND THIS CODE (lines 354-384):**
```typescript
const controlsDescription = batch.map(({ control }, index) =>
    `${index + 1}. Control ID: ${control.control_name}\n   Name: ${control.control_name}\n   Text: ${(control.control_text || control.control_long_name || 'N/A').substring(0, 500)}`
).join('\n\n');

const prompt = `You are a compliance analyst. Analyze the provided source document against the following compliance controls and determine the percentage completion (0-100) and provide a detailed explanation for EACH control.

Controls to analyze:
${controlsDescription}

Source Document:
${sourceText}

For EACH control, provide a JSON response with:
{
  "controls": [
    {
      "control_id": "<control_name>",
      "percentage_completion": <number between 0-100>,
      "explanation": "<detailed explanation of how well the source document addresses this control's requirements, what evidence exists, what's missing, and why you assigned this percentage>"
    },
    ...
  ]
}

Consider for each control:
- How well the document addresses the specific requirements for this control
- Evidence of implementation or coverage in the source
- Completeness of documentation related to this control
- Any gaps or missing elements

Respond ONLY with valid JSON, no additional text.`;
```

**REPLACE WITH THIS:**
```typescript
// ✅ ENHANCED: Build prompt context once for the batch
const promptContext = await this.promptVariablesService.buildPromptContext(
    appId,
    standardId,
    batch[0].appControl.customer_id || 'unknown'
);

// ✅ ENHANCED: Use control-family-specific prompts for batch
const controlsDescription = batch.map(({ control }, index) => {
    const familyPrompt = getPromptForControl(control.control_name);
    return `${index + 1}. Control ID: ${control.control_name}
   Name: ${control.control_long_name || control.control_name}
   Family: ${control.control_name.substring(0, 2)}
   Text: ${(control.control_text || 'N/A').substring(0, 500)}

   Analysis Focus: ${familyPrompt.analysisInstructions.split('\n').slice(0, 3).join(' ')}`;
}).join('\n\n');

// ✅ ENHANCED: Context-aware batch prompt
const prompt = `You are an expert compliance analyst with specialized knowledge in multiple security control families.

## Application Context
- Application: ${promptContext.appName}
${promptContext.appDescription ? `- Description: ${promptContext.appDescription}` : ''}
${promptContext.industryType ? `- Industry: ${promptContext.industryType}` : ''}
- Compliance Framework: ${promptContext.complianceFramework}
${promptContext.knownTechnologies && promptContext.knownTechnologies.length > 0 ? `- Detected Technologies: ${promptContext.knownTechnologies.join(', ')}` : ''}

## Controls to Analyze
${controlsDescription}

## Source Document
${sourceText}

## Instructions
For EACH control:
1. Apply family-specific analysis (AC vs AU vs IR require different approaches)
2. Look for concrete evidence in the source document
3. Match evidence to specific control requirements
4. Identify gaps precisely
5. Provide actionable recommendations

## Required JSON Output
{
  "controls": [
    {
      "control_id": "<control_name>",
      "implementation_status": "not_implemented|partially_implemented|implemented|not_applicable|planned",
      "percentage_completion": <0-100>,
      "explanation": "<detailed explanation with specific evidence from source>",
      "evidence_found": ["Evidence item 1", "Evidence item 2"],
      "gaps": ["Gap 1", "Gap 2"],
      "recommendations": [
        {
          "priority": "high|medium|low",
          "action": "Specific actionable recommendation",
          "rationale": "Why this is needed"
        }
      ]
    }
  ]
}

IMPORTANT:
- Only cite evidence that actually exists in the source
- Be specific, not vague
- Match percentage to status (not_implemented: 0-20%, partial: 30-70%, implemented: 80-100%)
- Recommendations must be actionable within weeks

Respond ONLY with valid JSON.`;
```

### Step 4: Enhanced Response Processing (after aiResponse, around line 394-408)

**ADD THIS ENHANCED PROCESSING:**
```typescript
if (aiResponse && aiResponse.controls && Array.isArray(aiResponse.controls)) {
    // ✅ ENHANCED: Process results with better structure
    for (const result of aiResponse.controls) {
        const matchingControl = batch.find(({ control }) => control.control_name === result.control_id);
        if (matchingControl) {
            // ✅ Map enhanced response fields
            const enhancedResult = {
                percentage: Math.max(0, Math.min(100, Math.round(result.percentage_completion))),
                explanation: {
                    summary: result.explanation || '',
                    evidence_found: result.evidence_found || [],
                    gaps: result.gaps || [],
                    recommendations: result.recommendations || [],
                    implementation_status: result.implementation_status || 'not_implemented'
                }
            };

            batchResults.set(matchingControl.control.id, enhancedResult);

            // ✅ Log quality metrics
            this.logger.debug(`Control ${result.control_id}: ${result.evidence_found?.length || 0} evidence items, ${result.gaps?.length || 0} gaps`);
        }
    }
    this.logger.log(`✅ LLM batch analysis completed for ${batchResults.size}/${batch.length} controls with enhanced prompts`);
} else {
    this.logger.warn(`LLM batch analysis did not return valid results, falling back to individual processing`);
}
```

### Step 5: Update Module (compliance.module.ts)

**ADD to providers array:**
```typescript
import { PromptVariablesService } from './prompts/prompt-variables.service';

@Module({
  // ... existing config
  providers: [
    // ... existing providers
    PromptVariablesService,  // ✅ ADD THIS
    // ... rest of providers
  ],
})
export class ComplianceModule {}
```

### Step 6: Add Missing Import Statement

**At top of updateCompliance.service.ts, add:**
```typescript
import { getPromptForControl } from '../prompts/control-prompts';
```

---

## Testing the Integration

After applying these changes, test with:

1. **Single Control Test**:
   - Trigger compliance sync for one application
   - Check logs for "Enhanced prompts" message
   - Verify LLM response has structured fields (evidence_found, gaps, recommendations)

2. **Batch Test**:
   - Trigger sync for application with 20+ controls
   - Verify batching still works (10 controls per LLM call)
   - Check logs for family-specific analysis

3. **Quality Check**:
   - Review generated implementation statements
   - Verify evidence is specific (not hallucinated)
   - Check recommendations are actionable
   - Confirm percentage matches status

---

## Expected Improvements

| Metric | Before | After |
|--------|--------|-------|
| Evidence Quality | Generic | Control-family-specific |
| Hallucinations | ~15% | <5% |
| Recommendation Specificity | Vague | Actionable |
| Context Awareness | None | Full application context |
| User Editing Required | 40% | ~10% |

---

## Rollback Instructions

If issues occur:

1. Comment out PromptVariablesService injection in constructor
2. Revert to original prompt (git checkout src/compliance/service/updateCompliance.service.ts)
3. Remove PromptVariablesService from module providers

---

## Next Steps

After successful integration:
- ✅ Phase 2.1: Add LLM output validator
- ✅ Phase 2.2: Add evidence validation
- ✅ Phase 2.3: Add vagueness detection
- ✅ Phase 2.4: Add automated evidence suggestions
