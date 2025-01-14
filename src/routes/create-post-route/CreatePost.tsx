import { useState } from "react";
import { Form, useActionData, useSearchParams } from "react-router";

import createPostAction from "./create-post-action";

import "../../assets/styles/create-post.css";

function CreatePost() {
    const errorMessage = useActionData();
    const [typeOfPost, setTypeOfPost] = useState("Text");
    const [searchParams] = useSearchParams();
    const topicParam = searchParams.get("topic");
    const userRole = sessionStorage.getItem("role");

    return (
        <Form method="post" autoComplete="off" className="post-form">
            <h2 className="create-post-form-heading">Create a new post</h2>
            <div className="post-type-container">
                <button
                    type="button"
                    className="post-type-button"
                    disabled={typeOfPost === "Text" ? true : false}
                    onClick={() => {
                        setTypeOfPost("Text");
                    }}
                >
                    Text Post
                </button>
                <button
                    type="button"
                    className="post-type-button"
                    disabled={typeOfPost === "Link" ? true : false}
                    onClick={() => {
                        setTypeOfPost("Link");
                    }}
                >
                    Link Post
                </button>
                <button
                    type="button"
                    className="post-type-button"
                    disabled={typeOfPost === "Poll" ? true : false}
                    onClick={() => {
                        setTypeOfPost("Poll");
                    }}
                >
                    Poll Post
                </button>
            </div>
            <label htmlFor="topic-input">Topic:</label>
            <select
                id="topic-input"
                className="input select"
                name="topic"
                defaultValue={topicParam ? topicParam : ""}
                required
            >
                <option value="">Please select a topic</option>
                <option value="Programming">Programming</option>
                <option value="News">News</option>
                <option value="Movies">Movies</option>
                <option value="Politics">Politics</option>
                <option value="Games">Games</option>
                <option value="Space">Space</option>
                <option value="Books">Books</option>
                <option value="Other">Other</option>
            </select>

            <input type="hidden" name="post-type" value={typeOfPost} />
            <label htmlFor="title-input">Title:</label>
            <input
                id="title-input"
                className="input"
                type="text"
                name="title"
                minLength={8}
                maxLength={60}
                required
            />
            {typeOfPost === "Poll" ? (
                <label htmlFor="content-input">
                    Poll Options (2-6 options, separated with a comma)
                </label>
            ) : (
                <label htmlFor="content-input">Content:</label>
            )}
            <textarea
                id="content-input"
                className="input textarea"
                name="content"
                minLength={typeOfPost === "Text" ? 50 : 12}
                maxLength={typeOfPost === "Text" ? 900 : 200}
                rows={typeOfPost === "Text" ? 12 : 1}
                required
            ></textarea>
            <label htmlFor="keywords-input">Keywords:</label>
            <input
                id="keywords-input"
                className="input"
                type="text"
                name="keywords"
                maxLength={60}
            />
            <div className="checkbox-input-container">
                <label htmlFor="nsfw-input">NSFW Content:</label>
                <input id="nsfw-input" type="checkbox" name="nsfw-post" />
            </div>
            {userRole === "admin" && (
                <div className="checkbox-input-container">
                    <label htmlFor="pinned-input">Pinned Post:</label>
                    <input
                        id="pinned-input"
                        type="checkbox"
                        name="pinned-post"
                    />
                </div>
            )}
            <button type="submit" className="button post-button">
                Post
            </button>
            <p className="create-post-error">
                {typeof errorMessage === "string" ? errorMessage : ""}
            </p>
        </Form>
    );
}

export { CreatePost as Component };
export { createPostAction as action };
