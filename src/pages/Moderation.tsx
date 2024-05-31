import { useEffect, useRef } from "react";
import { Form, useActionData, useLoaderData } from "react-router-dom";

import { reportInterface } from "../utils/interfaces.ts";

import ModReport from "../components/ModReport.tsx";

import "../assets/styles/moderation.css";

export default function Moderation() {
    const loader = useLoaderData();
    const reportedMessages = Array.isArray(loader) ? loader : [];
    const reportElements = reportedMessages.map((report: reportInterface) => {
        return <ModReport key={report._id} report={report} />;
    });
    const userRole = sessionStorage.getItem("role");
    const actionMessage = useActionData();
    const notifyUserForm = useRef<HTMLFormElement>(null);
    const deleteAccountForm = useRef<HTMLFormElement>(null);
    const deletePostForm = useRef<HTMLFormElement>(null);
    const deleteCommentForm = useRef<HTMLFormElement>(null);
    const changeRoleForm = useRef<HTMLFormElement>(null);
    useEffect(() => {
        if (actionMessage) {
            if (notifyUserForm && notifyUserForm.current) {
                notifyUserForm.current.reset();
            }
            if (deleteAccountForm && deleteAccountForm.current) {
                deleteAccountForm.current.reset();
            }
            if (deletePostForm && deletePostForm.current) {
                deletePostForm.current.reset();
            }
            if (deleteCommentForm && deleteCommentForm.current) {
                deleteCommentForm.current.reset();
            }
            if (changeRoleForm && changeRoleForm.current) {
                changeRoleForm.current.reset();
            }
        }
    }, [actionMessage]);

    return (
        <>
            <h2 className="moderation-main-heading">Moderation Page</h2>
            <div className="moderation-main-container">
                <section className="moderation-forms-section">
                    <h3 className="section-heading">Moderation Actions</h3>
                    <Form
                        method="POST"
                        action="/moderation"
                        className="moderation-form"
                        ref={notifyUserForm}
                    >
                        <h4 className="form-heading">Send User Notification</h4>
                        <label htmlFor="notify-user-input">
                            User to be notified:
                        </label>
                        <input
                            id="notify-user-input"
                            className="input"
                            name="notification-user"
                            type="text"
                            pattern="[a-zA-Z0-9_]+"
                            maxLength={18}
                            required
                        />
                        <label htmlFor="notify-message-input">
                            Notification Message:
                        </label>
                        <textarea
                            id="notify-message-input"
                            className="input textarea"
                            name="notification-message"
                            minLength={4}
                            maxLength={120}
                            rows={6}
                            required
                        ></textarea>
                        <button type="submit" className="button">
                            Send
                        </button>
                    </Form>
                    <Form
                        method="DELETE"
                        action="/moderation"
                        className="moderation-form"
                        ref={deleteAccountForm}
                    >
                        <h4 className="form-heading">Delete User Account</h4>
                        <label htmlFor="username-input">
                            Username of account to be deleted:
                        </label>
                        <input
                            id="username-input"
                            className="input"
                            name="delete-account-username"
                            type="text"
                            pattern="[a-zA-Z0-9_]+"
                            maxLength={18}
                            required
                        />
                        <button type="submit" className="button">
                            Delete Account
                        </button>
                    </Form>
                    <Form
                        method="DELETE"
                        action="/moderation"
                        className="moderation-form"
                        ref={deletePostForm}
                    >
                        <h4 className="form-heading">Delete Post</h4>
                        <label htmlFor="post-id-input">
                            Id number of post to be deleted:
                        </label>
                        <input
                            id="post-id-input"
                            className="input"
                            name="delete-post-id"
                            type="text"
                            pattern="[a-zA-Z0-9]+"
                            maxLength={25}
                            required
                        />
                        <button type="submit" className="button">
                            Delete Post
                        </button>
                    </Form>
                    <Form
                        method="DELETE"
                        action="/moderation"
                        className="moderation-form"
                        ref={deleteCommentForm}
                    >
                        <h4 className="form-heading">Delete Comment</h4>
                        <label htmlFor="comment-id-input">
                            Id number of comment to be deleted:
                        </label>
                        <input
                            id="comment-id-input"
                            className="input"
                            name="delete-comment-id"
                            type="text"
                            pattern="[a-zA-Z0-9]+"
                            maxLength={25}
                            required
                        />
                        <button type="submit" className="button">
                            Delete Comment
                        </button>
                    </Form>
                    {userRole === "admin" && (
                        <Form
                            method="patch"
                            action="/moderation"
                            className="moderation-form"
                            ref={changeRoleForm}
                        >
                            <h4 className="form-heading">
                                Change Account Role
                            </h4>
                            <label htmlFor="change-role-input">
                                Username of account to be updated:
                            </label>
                            <input
                                id="change-role-input"
                                className="input"
                                name="change-role-username"
                                type="text"
                                pattern="[a-zA-Z0-9_]+"
                                maxLength={18}
                                required
                            />
                            <label htmlFor="new-role">New Role:</label>
                            <select
                                id="new-role"
                                className="input select"
                                name="new-role-input"
                                required
                            >
                                <option value="">Select new role:</option>
                                <option value="user">User</option>
                                <option value="mod">Mod</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button type="submit" className="button">
                                Update Account
                            </button>
                        </Form>
                    )}
                    <p className="moderation-form-message">
                        {typeof actionMessage === "string" ? actionMessage : ""}
                    </p>
                </section>
                <section className="reports-section">
                    <h3 className="section-heading">
                        Reported posts and comments
                    </h3>
                    <div>{reportElements.length > 0 && reportElements}</div>
                </section>
            </div>
        </>
    );
}
