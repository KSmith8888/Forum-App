import { loaderActionInterface } from "../utils/interfaces";

export default async function postAction({ request }: loaderActionInterface) {
    try {
        const token = sessionStorage.getItem("token");
        const userId = sessionStorage.getItem("_id");
        if (!token || !userId) {
            throw new Error("You must log in before creating a post");
        }
        const postForm = await request.formData();
        const content = postForm.get("content");
        const postId = postForm.get("postId");
        const commentId = postForm.get("commentId");
        const replyType = postForm.get("type");
        const reportRelated = postForm.get("report-related-id");
        const reportId = postForm.get("report-message-id");
        const reportType = postForm.get("report-type");
        const reportContent = postForm.get("report-content");
        const savePostId = postForm.get("save-post-id");
        const savePostTitle = postForm.get("save-post-title");
        const likePostId = postForm.get("like-post-id");
        const likeCommentId = postForm.get("like-comment-id");
        let dataUrl = `${
            import.meta.env.VITE_BACKEND_URL
        }/api/v1/comments/create`;
        let dataMethod = "POST";
        let dataBody = {};
        if (
            content &&
            typeof content === "string" &&
            typeof postId === "string" &&
            typeof replyType === "string" &&
            typeof commentId === "string"
        ) {
            const reg = new RegExp("^[a-zA-Z0-9 .:,?/_'!@\r\n-]+$");
            if (
                !reg.test(content) ||
                content.toLowerCase().includes("javascript:") ||
                content.toLowerCase().includes("data:")
            ) {
                throw new Error(
                    "Please do not include special characters in your message"
                );
            }
            if (content.includes("https://")) {
                const attemptedLinks: string[] = [];
                const contentWords = content.split(" ");
                const reg = new RegExp("^[a-zA-Z0-9.:/_-]+$");
                contentWords.forEach((word) => {
                    if (word.startsWith("https://")) {
                        attemptedLinks.push(word);
                    }
                });
                attemptedLinks.forEach((link) => {
                    const isValid = URL.canParse(link);
                    if (!isValid || !reg.test(link) || !link.includes(".")) {
                        throw new Error("Invalid link provided");
                    }
                });
            }
            dataBody = {
                content,
                postId,
                commentId,
                replyType,
            };
        } else if (
            typeof reportId === "string" &&
            typeof reportRelated === "string" &&
            typeof reportType === "string" &&
            typeof reportContent === "string"
        ) {
            if (reportId === "none" || reportType === "none") {
                throw new Error("Report information not provided");
            }
            dataUrl = `${
                import.meta.env.VITE_BACKEND_URL
            }/api/v1/moderation/report`;
            dataBody = {
                reportId,
                reportType,
                reportRelated,
                reportContent,
            };
        } else if (
            typeof savePostId === "string" &&
            typeof savePostTitle === "string"
        ) {
            dataMethod = "PATCH";
            dataUrl = `${
                import.meta.env.VITE_BACKEND_URL
            }/api/v1/posts/save/${savePostId}`;
            dataBody = { postTitle: savePostTitle };
        } else if (typeof likePostId === "string") {
            dataUrl = `${
                import.meta.env.VITE_BACKEND_URL
            }/api/v1/posts/likes/${likePostId}`;
            dataMethod = "PATCH";
            dataBody = { status: "Update like count" };
        } else if (typeof likeCommentId === "string") {
            dataUrl = `${
                import.meta.env.VITE_BACKEND_URL
            }/api/v1/comments/likes/${likeCommentId}`;
            dataMethod = "PATCH";
            dataBody = { status: "Update like count" };
        } else {
            throw new Error("Proper data not provided");
        }

        const res = await fetch(dataUrl, {
            method: dataMethod,
            body: JSON.stringify(dataBody),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "user_id": userId,
            },
        });
        if (!res.ok) {
            const errorData = await res.json();
            if (errorData && errorData.message) {
                throw new Error(errorData.message);
            } else {
                throw new Error(`Status ${res.status}`);
            }
        }
        const data = await res.json();
        if (
            data &&
            typeof data === "object" &&
            "didUserSave" in data &&
            "postId" in data
        ) {
            const currentSavedPosts = sessionStorage.getItem("saved-posts");
            if (currentSavedPosts) {
                const prevSavedPosts = JSON.parse(currentSavedPosts);
                if (data.didUserSave) {
                    sessionStorage.setItem(
                        "saved-posts",
                        JSON.stringify([...prevSavedPosts, data.postId])
                    );
                } else if (!data.didUserSave && currentSavedPosts.length > 1) {
                    const filteredSavedPosts = prevSavedPosts.filter(
                        (savedId: string) => {
                            return savedId !== data.postId;
                        }
                    );
                    sessionStorage.setItem(
                        "saved-posts",
                        JSON.stringify(filteredSavedPosts)
                    );
                } else if (
                    !data.didUserSave &&
                    currentSavedPosts.length === 1
                ) {
                    sessionStorage.removeItem("saved-posts");
                }
            } else {
                sessionStorage.setItem(
                    "saved-posts",
                    JSON.stringify([data.postId])
                );
            }
        } else if (
            data &&
            typeof data === "object" &&
            "didUserLike" in data &&
            "likePostId" in data
        ) {
            const savedLikedPosts = sessionStorage.getItem("likedPosts");
            if (savedLikedPosts) {
                const prevLikedPosts = JSON.parse(savedLikedPosts);
                if (data.didUserLike) {
                    sessionStorage.setItem(
                        "likedPosts",
                        JSON.stringify([...prevLikedPosts, data.likePostId])
                    );
                } else if (!data.didUserLike && savedLikedPosts.length > 1) {
                    const filteredLikedPosts = prevLikedPosts.filter(
                        (likeId: string) => {
                            return likeId !== data.likePostId;
                        }
                    );
                    sessionStorage.setItem(
                        "likedPosts",
                        JSON.stringify(filteredLikedPosts)
                    );
                } else if (!data.didUserLike && savedLikedPosts.length === 1) {
                    sessionStorage.removeItem("likedPosts");
                }
            } else {
                sessionStorage.setItem(
                    "likedPosts",
                    JSON.stringify([data.likePostId])
                );
            }
        } else if (
            data &&
            typeof data === "object" &&
            "didLikeComment" in data &&
            "likeCommentId" in data
        ) {
            const savedLikedComments = sessionStorage.getItem("likedComments");
            if (savedLikedComments) {
                const prevLikedComments = JSON.parse(savedLikedComments);
                if (data.didUserLike) {
                    sessionStorage.setItem(
                        "likedComments",
                        JSON.stringify([
                            ...prevLikedComments,
                            data.likeCommentId,
                        ])
                    );
                } else if (!data.didUserLike && savedLikedComments.length > 1) {
                    const filteredLikedComments = prevLikedComments.filter(
                        (likeComment: string) => {
                            return likeComment !== data.likeCommentId;
                        }
                    );
                    sessionStorage.setItem(
                        "likedComments",
                        JSON.stringify(filteredLikedComments)
                    );
                } else if (
                    !data.didUserLike &&
                    savedLikedComments.length === 1
                ) {
                    sessionStorage.removeItem("likedComments");
                }
            } else {
                sessionStorage.setItem(
                    "likedComments",
                    JSON.stringify([data.likeCommentId])
                );
            }
        }
        return data;
    } catch (error) {
        let message = "There was an error, please try again later";
        if (error instanceof Error) {
            message = error.message;
        }
        return `Error: ${message}`;
    }
}
