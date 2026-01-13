import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comments } from 'src/entities/comments.entity';
import { User } from 'src/entities/user.entity';
import { IsNull, Repository } from 'typeorm';

// import { isValidUUId } from '../common/utils';

const isValidUUId = (str) => {
    // Regular expression to check if string is a valid UUID
    const regexExp =
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    return regexExp.test(str);
};

// const savedComments = {};

const dummySources = [
    {
        id: "48601eae-0a09-4bd2-92a1-8bbef7ef46c5",
        sectionId: "d1843c5e-cc91-4d5a-9f27-e1c39c4b7e28",
        sourceName: "okta",
        title: "4 Compliance Regulations Every CISO Should Know - Okta",
        description: "The job of a CISO is a tough one. Adaptability is key in a field where change is the only real constant, as new laws, evolving regulations, and increasingly complex security threats challenge even the most seasoned executive.",
    },
    {
        id: "0a5b07b1-1c6e-45c3-94ec-9e70f10c8455",
        sectionId: "2b99aab4-efb6-4b07-9b2a-e610c94d2f67",
        sourceName: "securitymagazine",
        title: "CISO considerations for data privacy & compliance in 2023",
        description: "On August 24, 2022, California’s attorney general announced a settlement of $1.2 million with Sephora, as a result of...",
    },
    {
        id: "d36b2444-4c0d-42c2-8c7b-ff2a5b16f1c1",
        sectionId: "6e4abdf4-d76c-4a75-93f0-5374ef9d2d60",
        sourceName: "iclg",
        title: "Cybersecurity Laws and Regulations Report 2024 USA - ICLG.com",
        description: "Published: 14/11/2023 ICLG - Cybersecurity Laws and Regulations - USA Chapter covers common issues in cybersecurity...",
    },
];

@Injectable()
export class SspService {

    constructor(
        @InjectRepository(Comments) private commentsRepo: Repository<Comments>,
        @InjectRepository(User) private usersRepo: Repository<User>,
    ) {
    }

    async addComment(docId: string, comment: any, userInfo: any) {
        const userId = userInfo['userId'];
        if (!docId) {
            throw new BadRequestException({
                message: 'Please provide document id in url params.'
            });
        }
        if (!comment) {
            throw new BadRequestException({
                message: 'No comment data provided in request body.'
            });
        }
        if (!comment.section_id) {
            throw new BadRequestException({
                message: 'Please provide section_id in comment data.'
            });
        }
        if (!comment.comment) {
            throw new BadRequestException({
                message: 'Please provide comment in comment data.'
            });
        }

        if (!comment.selected_text) {
            throw new BadRequestException({
                message: 'Please provide selected_text in comment data.'
            });
        }

        try {
            const toCreate = this.commentsRepo.create({
                doc_id: docId,
                section_id: comment.section_id,
                element_id: comment.element_id,
                comment: comment.comment,
                selected_text: comment.selected_text,
                created_at: new Date(),
                user_id: userId
            });
            await this.commentsRepo.save(toCreate);
            return {
                message: 'Comment added successfully!'
            }
        } catch (error) {
            throw new BadRequestException({
                message: `Could not add comment at the moment. Please try again later.`,
                details: error.message
            });
        }
    }

    async getComments(docId: string) {
        if (!docId) {
            throw new BadRequestException({
                message: 'Please provide document id in url params.'
            });
        }

        return this.commentsRepo.find({
            where: {
                doc_id: docId
            },
            relations: {
                user: true
            },
            order: {
                created_at: 'DESC'
            }
        });
    }

    async deleteComment(docId: string, commentId: string, userInfo: any) {
        if (!docId) {
            throw new BadRequestException({
                message: 'Document id is invalid.'
            });
        }

        if (!commentId) {
            throw new BadRequestException({
                message: 'Comment id is invalid.'
            });
        }

        this.commentsRepo.delete({ id: commentId, doc_id: docId });
    }

    async getDocSources(docId: string) {
        if (!docId) {
            throw new BadRequestException({
                message: 'Please provide document id in url params.'
            });
        }

        //need more info on this
        return {
            data: dummySources
        }
    }

}
