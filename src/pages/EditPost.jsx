import React, { useState } from "react";
import { redirect, useLoaderData, Form } from "react-router-dom";

export async function editPostLoader({ params }) {
    try {
        const userId = sessionStorage.getItem("_id");
        if (!userId) {
            return redirect("/?message=Please log in");
        }
        const postId = params.id;
        const res = await fetch(
            `http://127.0.0.1:3000/api/v1/posts/details/${postId}`
        );
        if (!res.ok) {
            throw new Error(`Status error: ${res.status}`);
        }
        const data = await res.json();
        return data.post;
    } catch (error) {
        return { msg: error.message };
    }
}

export async function editPostAction({ request, params }) {
    try {
        const postId = params.id;
        const postData = await request.formData();
        const title = postData.get("title");
        const content = postData.get("content");
        const token = sessionStorage.getItem("token");
        const userId = sessionStorage.getItem("_id");
        const reg = new RegExp("^[a-zA-Z0-9 .:,!-]+$");
        if (!reg.test(title) || !reg.test(content)) {
            throw new Error(
                "Please do not include special characters in your message"
            );
        }
        if (!token || !userId) {
            throw new Error("You must log in before creating a post");
        }
        const res = await fetch(
            `http://127.0.0.1:3000/api/v1/posts/details/${postId}`,
            {
                method: "PATCH",
                body: JSON.stringify({ title, content }),
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
        return redirect(`/posts/details/${postId}`);
    } catch (error) {
        console.error(error.message);
        return error.message;
    }
}

export default function EditPost() {
    const postData = useLoaderData();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    if (postData.err) {
        setErrorMsg(postData.err);
    }

    return (
        <div className="edit-post-container">
            <Form method="post" className="post-form">
                <h2>Edit Post</h2>
                <label htmlFor="title-input">Title:</label>
                <input
                    id="title-input"
                    name="title"
                    className="input"
                    type="text"
                    minLength="4"
                    maxLength="60"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                    }}
                    required
                ></input>
                <label htmlFor="content-input">Content:</label>
                <textarea
                    id="content-input"
                    className="input textarea"
                    name="content"
                    minLength="4"
                    maxLength="900"
                    rows="12"
                    cols="50"
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                    }}
                    required
                ></textarea>
                <button type="submit" className="button">
                    Update
                </button>
                <p className="error-message">{errorMsg}</p>
            </Form>
            <div className="previous-post">
                <h2>Previous Post Content</h2>
                <p>{postData.title}</p>
                <p>{postData.content}</p>
            </div>
        </div>
    );
}
