export interface outletInterface {
    isUserLoggedIn: boolean;
    setIsUserLoggedIn: (isUserLoggedIn: boolean) => void;
    setHasPicBeenUpdated: (hasPicBeenUpdated: boolean) => void;
}

export interface loaderActionInterface {
    request: Request;
    params: {
        id?: string;
        topic?: string;
    };
}

export interface postHistoryInterface {
    title: string;
    content: string;
    timestamp: string;
}

export interface commentHistoryInterface {
    content: string;
    timestamp: string;
}

export interface postRelatedComments {
    post: postInterface;
    comments: Array<commentInterface>;
}

export interface likeInterface {
    status: string;
    likes: number;
    didUserLike: boolean;
}

export interface postInterface {
    _id: string;
    title: string;
    content: string;
    topic: string;
    likes: number;
    user: string;
    keywords: string[];
    comments: string[];
    hasBeenEdited: boolean;
    history: Array<postHistoryInterface>;
    createdAt: string;
    updatedAt: string;
    profileImageName: string;
    profileImageAlt: string;
}

export interface commentInterface {
    _id: string;
    content: string;
    likes: number;
    user: string;
    relatedPost: string;
    hasBeenEdited: boolean;
    history: Array<commentHistoryInterface>;
    createdAt: string;
    updatedAt: string;
    profileImageName: string;
    profileImageAlt: string;
}

export interface commentProps {
    commentData: commentInterface;
    isUserLoggedIn: boolean;
    openReportModal: () => void;
}

export interface profilePicInterface {
    name: string;
    alt: string;
}

export interface reportInterface {
    messageId: string;
    messageType: string;
    reportedBy: string;
    relatedPost: string;
    createdAt: string;
    updatedAt: string;
}
