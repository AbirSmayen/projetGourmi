import React, { useState } from "react"
import axios from "axios"
import { FaHeart, FaRegHeart, FaComment, FaTrash, FaEdit, FaEye } from "react-icons/fa"
import Swal from "sweetalert2"

export default function RecipeInteractions({ recipe, onAuthRequired, refreshRecipe }) {
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState("")

  const token = localStorage.getItem("token")
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
  
  const isLiked = recipe.likes?.includes(currentUser._id)
  const likesCount = recipe.likes?.length || 0

  const handleLike = async () => {
    if (!token) {
      onAuthRequired("like this recipe")
      return
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/recipes/${recipe._id}/like`,
        {},
        {
          headers: { authorization: `bearer ${token}` }
        }
      )
      
      if (res.data.success) {
        refreshRecipe()
      }
    } catch (err) {
      console.error("Error liking recipe:", err)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to like recipe"
      })
    }
  }

  // Voir qui a liké
  const showLikers = async () => {
  if (likesCount === 0) {
    Swal.fire({
      icon: "info",
      title: "No likes yet",
      text: "Be the first to like this recipe!"
    })
    return
  }

  try {
    // Récupérer les détails complets de la recette avec les likes populés
    const res = await axios.get(`http://localhost:5000/api/recipes/${recipe._id}`)
    const fullRecipe = res.data
    
    // Créer la liste HTML des personnes qui ont liké
    const likersList = fullRecipe.likes?.map((user) => {
      const firstName = user.firstName || ""
      const lastName = user.lastName || ""
      const fullName = firstName && lastName 
        ? `${firstName} ${lastName}` 
        : firstName || lastName || user.email || "Anonymous User"
      
      return `
        <li style="text-align: left; padding: 8px 0; border-bottom: 1px solid #eee;">
          <span style="color: #ce1212; font-weight: bold;">👤</span> 
          ${fullName}
        </li>
      `
    }).join('') || '<p>No likes data available</p>'

    Swal.fire({
      title: `<span style="color: #ce1212;">${likesCount} ${likesCount === 1 ? 'Person' : 'People'} liked this recipe</span>`,
      html: `<ul style="list-style: none; padding: 0; max-height: 300px; overflow-y: auto;">${likersList}</ul>`,
      icon: "info",
      confirmButtonColor: "#ce1212",
      confirmButtonText: "Close",
      width: '500px'
    })
  } catch (err) {
    console.error("Error fetching likers:", err)
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load users who liked this recipe"
    })
  }
}

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      onAuthRequired("comment on this recipe")
      return
    }

    if (!commentText.trim()) {
      return
    }

    setSubmittingComment(true)

    try {
      const res = await axios.post(
        `http://localhost:5000/api/recipes/${recipe._id}/comment`,
        { text: commentText },
        {
          headers: { authorization: `bearer ${token}` }
        }
      )

      if (res.data.success) {
        setCommentText("")
        refreshRecipe()
        Swal.fire({
          icon: "success",
          title: "Comment added!",
          timer: 1500,
          showConfirmButton: false
        })
      }
    } catch (err) {
      console.error("Error adding comment:", err)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add comment"
      })
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId)
    setEditCommentText(currentText)
  }

  const handleSaveEdit = async (commentId) => {
    if (!editCommentText.trim()) {
      return
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/recipes/${recipe._id}/comment/${commentId}`,
        { text: editCommentText },
        {
          headers: { authorization: `bearer ${token}` }
        }
      )

      if (res.data.success) {
        setEditingCommentId(null)
        setEditCommentText("")
        refreshRecipe()
        Swal.fire({
          icon: "success",
          title: "Comment updated!",
          timer: 1500,
          showConfirmButton: false
        })
      }
    } catch (err) {
      console.error("Error editing comment:", err)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to edit comment"
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditCommentText("")
  }

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: "Delete comment?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    })

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(
          `http://localhost:5000/api/recipes/${recipe._id}/comment/${commentId}`,
          {
            headers: { authorization: `bearer ${token}` }
          }
        )

        if (res.data.success) {
          refreshRecipe()
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            timer: 1500,
            showConfirmButton: false
          })
        }
      } catch (err) {
        console.error("Error deleting comment:", err)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete comment"
        })
      }
    }
  }

  const getUserFullName = (user) => {
    if (!user) return "Anonymous"
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    return firstName || lastName || user.email || "Anonymous"
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return d.toLocaleDateString()
  }

  return (
    <div className="recipe-interactions mt-5">
      {/* Like Section */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: '10px' }}>
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button
              onClick={handleLike}
              className="btn btn-lg"
              style={{
                background: isLiked ? '#ff6b6b' : 'transparent',
                border: '2px solid #ff6b6b',
                color: isLiked ? 'white' : '#ff6b6b',
                borderRadius: '50px',
                padding: '10px 25px',
                transition: 'all 0.3s ease'
              }}
            >
              {isLiked ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
              <span className="ms-2 fw-bold">{likesCount}</span>
            </button>
            
            {likesCount > 0 && (
              <button
                onClick={showLikers}
                className="btn btn-outline-secondary btn-sm"
                style={{ borderRadius: '20px' }}
              >
                <FaEye className="me-1" />
                See who liked
              </button>
            )}
            
            <span className="text-muted">
              {likesCount === 0 ? "Be the first to like this recipe!" : 
               likesCount === 1 ? "1 person likes this" : 
               `${likesCount} people like this`}
            </span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card shadow-sm" style={{ borderRadius: '10px' }}>
        <div className="card-body">
          <h4 className="mb-4" style={{ color: '#ce1212' }}>
            <FaComment className="me-2" />
            Comments ({recipe.comments?.length || 0})
          </h4>

          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <div className="input-group">
              <textarea
                className="form-control"
                rows="2"
                placeholder={token ? "Add a comment..." : "Sign in to comment"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!token || submittingComment}
                style={{ borderRadius: '10px 0 0 10px', resize: 'none' }}
              />
              <button
                type="submit"
                className="btn btn-danger"
                disabled={!token || !commentText.trim() || submittingComment}
                style={{ borderRadius: '0 10px 10px 0' }}
              >
                {submittingComment ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {recipe.comments && recipe.comments.length > 0 ? (
              recipe.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="comment-item p-3 mb-3"
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '10px',
                    border: '1px solid #e9ecef'
                  }}
                >
                  {editingCommentId === comment._id ? (
                    // Mode édition
                    <div>
                      <textarea
                        className="form-control mb-2"
                        rows="3"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        style={{ resize: 'none' }}
                      />
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(comment._id)}
                          className="btn btn-sm btn-success"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn btn-sm btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="fw-bold" style={{ color: '#ce1212' }}>
                            {getUserFullName(comment.user)}
                          </span>
                          <span className="text-muted small">
                            {formatDate(comment.createdAt)}
                            {comment.isEdited && <span className="ms-1">(edited)</span>}
                          </span>
                        </div>
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                          {comment.text}
                        </p>
                      </div>
                      {comment.user?._id === currentUser._id && (
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleEditComment(comment._id, comment.text)}
                            className="btn btn-sm btn-outline-primary"
                            style={{ minWidth: '40px' }}
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="btn btn-sm btn-outline-danger"
                            style={{ minWidth: '40px' }}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}