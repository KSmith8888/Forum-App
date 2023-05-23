import React, { useState } from "react";

import { likeComment } from "../utils/like.js";

export default function Comment({
    _id,
    content,
    commentHours,
    commentMinutes,
    commentDateString,
    commentHasBeenEdited,
    isUserLoggedIn,
    likes,
}) {
    const [commentLikes, setCommentLikes] = useState(likes);
    const [userLikedComment, setUserLikedComment] = useState(false);

    return (
        <div className="comment">
            <p className="comment-text">{content}</p>
            <p className="comment-info">
                <span className="comment-time">
                    Posted:{" "}
                    {`${commentHours > 12 ? commentHours - 12 : commentHours}:${
                        commentMinutes > 9
                            ? commentMinutes
                            : `0${commentMinutes}`
                    } ${commentDateString}`}
                </span>
                <span className="comment-likes">Likes: {commentLikes}</span>
                <span className="comment-edited">
                    {commentHasBeenEdited ? "Edited" : ""}
                </span>
            </p>
            {isUserLoggedIn && (
                <button
                    className={
                        userLikedComment
                            ? "like-button selected"
                            : "like-button"
                    }
                    onClick={async () => {
                        try {
                            const likesData = await likeComment(_id);
                            setCommentLikes(likesData.likes);
                            setUserLikedComment(likesData.didUserLike);
                        } catch (error) {
                            console.error(error.message);
                        }
                    }}
                >
                    Like
                </button>
            )}
        </div>
    );
}
