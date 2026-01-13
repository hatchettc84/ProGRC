# Metabase Setup Guide for ProGRC

## Overview

Metabase is a Business Intelligence (BI) and analytics tool that connects to your existing PostgreSQL database to create dashboards, visualizations, and reports. It does **not** replace your database - it connects to it for analysis.

## Access Metabase

Once deployed, Metabase will be available at:
- **URL**: `http://168.231.70.205/analytics/`
- **Direct Port**: `http://168.231.70.205:3002` (if needed)

## Initial Setup

### 1. First-Time Access

1. Navigate to `http://168.231.70.205/analytics/`
2. You'll be prompted to create an admin account
3. Fill in:
   - **First name**: Your name
   - **Last name**: Your last name
   - **Email**: Your email address
   - **Password**: Choose a strong password
   - **Company or team name**: ProGRC

### 2. Connect to ProGRC Database

After creating your admin account, you'll need to add the ProGRC PostgreSQL database as a data source:

1. Click **"Add your data"** or **"Add database"**
2. Select **PostgreSQL** as the database type
3. Enter the following connection details:

   ```
   Display name: ProGRC Database
   Host: postgres (or bff-postgres)
   Port: 5432
   Database name: progrc_bff
   Username: progrc
   Password: progrc_dev_password_change_me
   ```

4. Click **"Test connection"** to verify
5. If successful, click **"Save"**

### 3. Start Creating Dashboards

Once connected, you can:
- **Browse data**: Explore tables and columns
- **Create questions**: Write SQL queries or use the query builder
- **Create dashboards**: Combine multiple visualizations
- **Share insights**: Share dashboards with your team

## Useful Queries for GRC Analytics

### Compliance Status Overview
```sql
SELECT 
    standard_name,
    COUNT(*) as total_controls,
    SUM(CASE WHEN status = 'implemented' THEN 1 ELSE 0 END) as implemented,
    SUM(CASE WHEN status = 'not_applicable' THEN 1 ELSE 0 END) as not_applicable,
    ROUND(100.0 * SUM(CASE WHEN status = 'implemented' THEN 1 ELSE 0 END) / COUNT(*), 2) as compliance_percentage
FROM application_control_mapping_view
GROUP BY standard_name;
```

### Risk Level Distribution
```sql
SELECT 
    risk_level,
    COUNT(*) as control_count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM application_control_mapping_view
GROUP BY risk_level
ORDER BY 
    CASE risk_level
        WHEN 'high' THEN 1
        WHEN 'moderate' THEN 2
        WHEN 'low' THEN 3
        ELSE 4
    END;
```

### Vendor Review Status
```sql
SELECT 
    v.name as vendor_name,
    v.status as vendor_status,
    v.risk_level,
    COUNT(vr.id) as total_reviews,
    SUM(CASE WHEN vr.status = 'completed' THEN 1 ELSE 0 END) as completed_reviews
FROM vendors v
LEFT JOIN vendor_reviews vr ON v.id = vr.vendor_id
GROUP BY v.id, v.name, v.status, v.risk_level;
```

### Application Compliance Progress
```sql
SELECT 
    a.name as application_name,
    s.standard_name,
    COUNT(acm.id) as total_controls,
    ROUND(AVG(acm.percentage_completion::numeric), 2) as avg_completion
FROM application a
JOIN app_standard ast ON a.id = ast.app_id
JOIN standard s ON ast.standard_id = s.id
LEFT JOIN application_control_mapping acm ON a.id = acm.app_id AND s.id = acm.standard_id
GROUP BY a.id, a.name, s.id, s.standard_name
ORDER BY a.name, s.standard_name;
```

## Docker Service Management

### Start Metabase
```bash
docker compose up -d metabase
```

### Stop Metabase
```bash
docker compose stop metabase
```

### View Metabase Logs
```bash
docker compose logs -f metabase
```

### Restart Metabase
```bash
docker compose restart metabase
```

### Check Metabase Status
```bash
docker ps | grep metabase
```

## Troubleshooting

### Metabase Not Accessible

1. **Check container status**:
   ```bash
   docker ps | grep metabase
   ```

2. **Check logs**:
   ```bash
   docker compose logs metabase --tail=50
   ```

3. **Verify Nginx configuration**:
   ```bash
   nginx -t
   systemctl reload nginx
   ```

### Database Connection Issues

1. **Verify PostgreSQL is accessible from Metabase container**:
   ```bash
   docker compose exec metabase ping -c 3 postgres
   ```

2. **Test connection manually**:
   ```bash
   docker compose exec metabase sh -c "echo 'SELECT 1;' | psql -h postgres -U progrc -d progrc_bff"
   ```

3. **Check network connectivity**:
   ```bash
   docker network inspect bff-service-backend-dev_bff-network
   ```

### Performance Issues

- Metabase uses an embedded H2 database by default for its application data
- For production, consider using PostgreSQL for Metabase's application database
- Monitor memory usage: `docker stats bff-metabase`

## Security Considerations

1. **Change default password**: Use a strong password for the Metabase admin account
2. **Database credentials**: The database password is in docker-compose.yml - consider using secrets management
3. **Access control**: Configure user roles and permissions in Metabase
4. **Network isolation**: Metabase is on the same Docker network as the database - ensure proper firewall rules

## Next Steps

1. ✅ Metabase is deployed and accessible
2. ⏭️ Create initial admin account
3. ⏭️ Connect to ProGRC database
4. ⏭️ Create compliance dashboards
5. ⏭️ Set up user access and permissions
6. ⏭️ Create scheduled reports

## Resources

- [Metabase Documentation](https://www.metabase.com/docs/)
- [Metabase SQL Tutorial](https://www.metabase.com/learn/sql-questions/)
- [Metabase Dashboard Guide](https://www.metabase.com/learn/dashboards/)

