import React, { useState, useRef, useEffect } from "react";
import {
    useLoaderData,
    useOutletContext,
    Form,
    useActionData,
} from "react-router-dom";

import Comment from "../components/Comment";
import { likePost } from "../utils/like.ts";
import {
    outletInterface,
    postInterface,
    commentInterface,
} from "../utils/interfaces.ts";

export async function postLoader({ ...args }) {
    try {
        const postId = args.params.id;
        const response = await fetch(
            `http://127.0.0.1:3000/api/v1/posts/details/${postId}`
        );
        const data: postInterface = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        return error;
    }
}

export async function commentAction({ ...args }): Promise<string> {
    try {
        const commentData = await args.request.formData();
        const comment = commentData.get("comment") as string;
        const post = commentData.get("post");
        const token = sessionStorage.getItem("token");
        const userId = sessionStorage.getItem("_id");
        const reg = new RegExp("^[a-zA-Z0-9 .:,!-]+$", "m");
        if (!reg.test(comment)) {
            throw new Error(
                "Please do not include special characters in your message"
            );
        }
        if (!token || !userId) {
            throw new Error("You must log in before creating a post");
        }
        const res = await fetch(
            "http://127.0.0.1:3000/api/v1/comments/create",
            {
                method: "POST",
                body: JSON.stringify({ content: comment, postId: post }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "user_id": userId,
                },
            }
        );
        if (!res.ok) {
            throw new Error(`Response error: ${res.status}`);
        }
        const data = await res.json();
        return data._id;
    } catch (error) {
        let message = "Please try again later";
        if (error instanceof Error) {
            console.error(error.message);
            message = error.message;
        }
        return `Error: ${message}`;
    }
}

export default function Post() {
    const loaderData = useLoaderData() as {
        post: postInterface;
        comments: commentInterface[];
    };
    const postTimestamp = loaderData.post.createdAt;
    const postHasBeenEdited = loaderData.post.hasBeenEdited;
    const postDate = new Date(postTimestamp);
    const postHours = postDate.getHours();
    const postMinutes = postDate.getMinutes();
    const postDateString = postDate.toDateString();
    const { isUserLoggedIn } = useOutletContext<outletInterface>();
    let didUserAlreadyLike = false;
    const savedLikedPosts = sessionStorage.getItem("likedPosts");
    if (savedLikedPosts) {
        const parsedLikedPosts = JSON.parse(savedLikedPosts);
        if (parsedLikedPosts.includes(loaderData.post._id)) {
            didUserAlreadyLike = true;
        }
    }
    const [userLikedPost, setUserLikedPost] = useState(didUserAlreadyLike);
    const [postLikes, setPostLikes] = useState(loaderData.post.likes);
    const [showHistory, setShowHistory] = useState(false);
    const historyElements = loaderData.post.history.map(
        (prevVersion, index) => {
            const prevPostTimestamp = prevVersion.timestamp;
            const prevPostDate = new Date(prevPostTimestamp);
            const prevPostHours = prevPostDate.getHours();
            const prevPostMinutes = prevPostDate.getMinutes();
            const prevPostDateString = prevPostDate.toDateString();
            return (
                <article key={index} className="previous-post">
                    <h4 className="previous-post-title">{prevVersion.title}</h4>
                    <p className="previous-post-content">
                        {prevVersion.content}
                    </p>
                    <p className="previous-post-time">
                        Posted:{" "}
                        {`${
                            prevPostHours > 12
                                ? prevPostHours - 12
                                : prevPostHours
                        }:${
                            prevPostMinutes > 9
                                ? prevPostMinutes
                                : `0${prevPostMinutes}`
                        } ${prevPostDateString}`}
                    </p>
                </article>
            );
        }
    );
    const commentErrorMsg = (useActionData() as string) || "";
    const commentForm = useRef<HTMLFormElement>(null);
    useEffect(() => {
        if (commentForm.current) {
            commentForm.current.reset();
        }
    }, [commentErrorMsg]);
    const commentElements = loaderData.comments.map(
        (comment: commentInterface) => {
            const commentTimestamp = comment.createdAt;
            const commentDate = new Date(commentTimestamp);
            const commentHours = commentDate.getHours();
            const commentMinutes = commentDate.getMinutes();
            const commentDateString = commentDate.toDateString();
            return (
                <Comment
                    key={comment._id}
                    _id={comment._id}
                    content={comment.content}
                    commentHours={commentHours}
                    commentMinutes={commentMinutes}
                    commentDateString={commentDateString}
                    commentHasBeenEdited={comment.hasBeenEdited}
                    history={comment.history}
                    isUserLoggedIn={isUserLoggedIn}
                    likes={comment.likes}
                    username={comment.user}
                />
            );
        }
    );

    return (
        <div className="post-container">
            <article className="post">
                <h2 className="post-title">{loaderData.post.title}</h2>
                <p className="post-text">{loaderData.post.content}</p>
                <div className="post-likes-container">
                    <p className="post-likes">Likes: {postLikes}</p>
                    {isUserLoggedIn && (
                        <button
                            className={
                                userLikedPost
                                    ? "like-button selected"
                                    : "like-button"
                            }
                            onClick={async () => {
                                try {
                                    const likesData = await likePost(
                                        loaderData.post._id
                                    );
                                    setPostLikes(likesData.likes);
                                    setUserLikedPost(likesData.didUserLike);
                                } catch (error) {
                                    if (error instanceof Error) {
                                        console.error(error.message);
                                    }
                                }
                            }}
                        >
                            Like
                        </button>
                    )}
                </div>
                <div className="post-info-container">
                    <p className="post-author">
                        Author: {loaderData.post.user}
                    </p>
                    <p className="post-time">
                        Posted:{" "}
                        {`${postHours > 12 ? postHours - 12 : postHours}:${
                            postMinutes > 9 ? postMinutes : `0${postMinutes}`
                        } ${postDateString}`}
                    </p>

                    {postHasBeenEdited && (
                        <button
                            className="button"
                            type="button"
                            onClick={() => {
                                setShowHistory((prevShowHistory) => {
                                    return !prevShowHistory;
                                });
                            }}
                        >
                            Edit History
                        </button>
                    )}
                </div>
                {showHistory && (
                    <div className="post-history-container">
                        <h3>Previous Post Versions</h3>
                        {historyElements}
                    </div>
                )}
            </article>
            <div className="comments-container">{commentElements}</div>
            {isUserLoggedIn && (
                <Form className="comment-form" method="POST" ref={commentForm}>
                    <label
                        htmlFor="comment-input"
                        className="comment-form-label"
                    >
                        Leave a comment:
                    </label>
                    <textarea
                        id="comment-input"
                        className="input textarea"
                        name="comment"
                        maxLength={300}
                        minLength={4}
                        rows={6}
                        cols={40}
                    ></textarea>
                    <input
                        type="hidden"
                        value={loaderData.post._id}
                        name="post"
                    />
                    <button type="submit" className="button">
                        Submit
                    </button>
                    <p className="error-message">
                        {commentErrorMsg.startsWith("Error:")
                            ? commentErrorMsg
                            : ""}
                    </p>
                </Form>
            )}
        </div>
    );
}