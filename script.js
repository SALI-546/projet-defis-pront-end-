document.addEventListener('DOMContentLoaded', () => {
    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            const commentsContainer = document.getElementById('comments-container');

            const createComment = (comment) => {
                return `
                    <div class="comment" data-id="${comment.id}">
                        <div class="score">
                            <img src="./images/icon-plus.svg" alt="Plus" class="plus">
                            <span>${comment.score}</span>
                            <img src="./images/icon-minus.svg" alt="Minus" class="minus">
                        </div>
                        <div class="content">
                            <div class="header">
                                <img src="${comment.user.image.png}" alt="User avatar">
                                <span class="username">${comment.user.username}</span>
                                <span class="createdAt">${comment.createdAt}</span>
                                <div class="actions">
                                    <img src="./images/icon-reply.svg" alt="Reply" class="reply">
                                    <img src="./images/icon-edit.svg" alt="Edit" class="edit">
                                    <img src="./images/icon-delete.svg" alt="Delete" class="delete">
                                </div>
                            </div>
                            <div class="body">
                                ${comment.content}
                            </div>
                        </div>
                    </div>
                `;
            };

            const renderComments = () => {
                commentsContainer.innerHTML = '';
                data.comments.forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.innerHTML = createComment(comment);
                    commentsContainer.appendChild(commentElement);

                    comment.replies.forEach(reply => {
                        const replyElement = document.createElement('div');
                        replyElement.innerHTML = createComment(reply);
                        replyElement.classList.add('reply');
                        commentsContainer.appendChild(replyElement);
                    });
                });
            };

            renderComments();

            commentsContainer.addEventListener('click', (event) => {
                if (event.target.closest('.plus')) {
                    const scoreElement = event.target.closest('.score').querySelector('span');
                    scoreElement.textContent = parseInt(scoreElement.textContent) + 1;
                }

                if (event.target.closest('.minus')) {
                    const scoreElement = event.target.closest('.score').querySelector('span');
                    scoreElement.textContent = Math.max(0, parseInt(scoreElement.textContent) - 1);
                }

                if (event.target.closest('.reply')) {
                    const commentElement = event.target.closest('.comment');
                    const replyToUsername = commentElement.querySelector('.username').textContent;
                    const replyInputContainer = document.createElement('div');
                    replyInputContainer.classList.add('add-comment');
                    replyInputContainer.innerHTML = `
                        <img src="${data.currentUser.image.png}" alt="User avatar">
                        <textarea placeholder="Add a reply...">@${replyToUsername} </textarea>
                        <button class="send-reply">REPLY</button>
                    `;

                    // Remove any existing reply input containers
                    const existingReplyContainers = commentElement.querySelectorAll('.add-comment');
                    existingReplyContainers.forEach(container => container.remove());

                    commentElement.appendChild(replyInputContainer);

                    const sendReplyButton = replyInputContainer.querySelector('.send-reply');
                    sendReplyButton.addEventListener('click', () => {
                        const replyInput = replyInputContainer.querySelector('textarea');
                        const newReply = {
                            id: Date.now(),
                            content: replyInput.value,
                            createdAt: "Just now",
                            score: 0,
                            replyingTo: replyToUsername,
                            user: data.currentUser
                        };

                        data.comments.forEach(comment => {
                            if (comment.id === parseInt(commentElement.dataset.id)) {
                                comment.replies.push(newReply);
                            } else {
                                comment.replies.forEach(reply => {
                                    if (reply.id === parseInt(commentElement.dataset.id)) {
                                        reply.replies.push(newReply);
                                    }
                                });
                            }
                        });

                        renderComments();
                    });
                }

                if (event.target.closest('.edit')) {
                    const commentElement = event.target.closest('.comment');
                    const bodyElement = commentElement.querySelector('.body');
                    const content = bodyElement.textContent.trim();
                    bodyElement.innerHTML = `
                        <textarea>${content}</textarea>
                        <button class="save-edit">Save</button>
                    `;

                    const saveEditButton = bodyElement.querySelector('.save-edit');
                    saveEditButton.addEventListener('click', () => {
                        const newContent = bodyElement.querySelector('textarea').value;
                        data.comments.forEach(comment => {
                            if (comment.id === parseInt(commentElement.dataset.id)) {
                                comment.content = newContent;
                            } else {
                                comment.replies.forEach(reply => {
                                    if (reply.id === parseInt(commentElement.dataset.id)) {
                                        reply.content = newContent;
                                    }
                                });
                            }
                        });
                        renderComments();
                    });
                }

                if (event.target.closest('.delete')) {
                    const confirmDelete = confirm('Are you sure you want to delete this comment? This will remove the comment and can’t be undone.');
                    if (confirmDelete) {
                        const commentElement = event.target.closest('.comment');
                        const commentId = parseInt(commentElement.dataset.id);

                        data.comments = data.comments.filter(comment => comment.id !== commentId);
                        data.comments.forEach(comment => {
                            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
                        });

                        renderComments();
                    }
                }
            });

            const sendCommentButton = document.getElementById('send-comment');
            sendCommentButton.addEventListener('click', () => {
                const textarea = document.querySelector('.add-comment-container .add-comment textarea');
                const newComment = {
                    id: Date.now(),
                    content: textarea.value,
                    createdAt: "Just now",
                    score: 0,
                    user: data.currentUser,
                    replies: []
                };

                data.comments.push(newComment);
                textarea.value = '';
                renderComments();
            });
        });
});
