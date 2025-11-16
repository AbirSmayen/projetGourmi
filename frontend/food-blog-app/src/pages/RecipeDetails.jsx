import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Swal from "sweetalert2"
import Modal from "../components/Modal"
import InputForm from "../components/InputForm"
import { FaHeart, FaRegHeart, FaComment, FaCrown, FaCheckCircle, FaUser } from "react-icons/fa"
import { MdDelete, MdEdit } from "react-icons/md"
import { IoTimeOutline } from "react-icons/io5"

export default function RecipeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState("")
  const [showLikesModal, setShowLikesModal] = useState(false)

  const token = localStorage.getItem("token")
  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).id : null

  const fetchRecipe = async () => {
    console.log("Fetching recipe with ID:", id)
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`http://localhost:5000/api/recipes/${id}`)
      console.log("Recipe data:", res.data)
      setRecipe(res.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching recipe:", err)
      setError(err.response?.data?.message || err.message || "Failed to load recipe")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchRecipe()
    }
  }, [id])

  const handleAuthRequired = (action) => {
    Swal.fire({
      title: "Sign in required",
      text: `You need to sign in to ${action}`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sign In",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ce1212"
    }).then((result) => {
      if (result.isConfirmed) {
        setIsAuthModalOpen(true)
      }
    })
  }

  // Gérer les likes
  const handleLike = async () => {
    if (!token) {
      handleAuthRequired("like this recipe")
      return
    }

    try {
      await axios.post(
        `http://localhost:5000/api/recipes/${recipe._id}/like`,
        {},
        {
          headers: { 'authorization': 'bearer ' + token }
        }
      )
      fetchRecipe()
    } catch (err) {
      console.error("Error toggling like:", err)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update like',
        icon: 'error'
      })
    }
  }

  // Ajouter un commentaire
  const handleAddComment = async (e) => {
    e.preventDefault()
    
    if (!token) {
      handleAuthRequired("comment")
      return
    }

    if (!commentText.trim()) return

    try {
      await axios.post(
        `http://localhost:5000/api/recipes/${recipe._id}/comment`,
        { text: commentText },
        {
          headers: { 'authorization': 'bearer ' + token }
        }
      )
      setCommentText("")
      fetchRecipe()
    } catch (err) {
      console.error("Error adding comment:", err)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add comment',
        icon: 'error'
      })
    }
  }

  // Supprimer un commentaire
  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `http://localhost:5000/api/recipes/${recipe._id}/comment/${commentId}`,
          {
            headers: { 'authorization': 'bearer ' + token }
          }
        )
        Swal.fire({
          title: 'Deleted!',
          text: 'Comment has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
        fetchRecipe()
      } catch (err) {
        console.error("Error deleting comment:", err)
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete comment',
          icon: 'error'
        })
      }
    }
  }

  // Modifier un commentaire
  const handleEditComment = async (commentId) => {
    if (!editingCommentText.trim()) return

    try {
      await axios.put(
        `http://localhost:5000/api/recipes/${recipe._id}/comment/${commentId}`,
        { text: editingCommentText },
        {
          headers: { 'authorization': 'bearer ' + token }
        }
      )
      setEditingCommentId(null)
      setEditingCommentText("")
      Swal.fire({
        title: 'Updated!',
        text: 'Comment has been updated.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
      fetchRecipe()
    } catch (err) {
      console.error("Error editing comment:", err)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update comment',
        icon: 'error'
      })
    }
  }

  const getIngredientsArray = (ingredients) => {
    if (Array.isArray(ingredients)) {
      return ingredients
    }
    if (typeof ingredients === 'string') {
      return ingredients.split(',').map(item => item.trim())
    }
    return []
  }

  const getUserFullName = (createdBy) => {
    if (!createdBy) return "Anonymous User"
    
    const firstName = createdBy.firstName || ""
    const lastName = createdBy.lastName || ""
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    
    if (firstName) return firstName
    if (lastName) return lastName
    
    return createdBy.email || "Anonymous User"
  }

  // Fonction pour obtenir le badge de statut
  const getRecipeBadge = () => {
    if (recipe.isOfficial) {
      return (
        <span 
          className="badge" 
          style={{ 
            backgroundColor: '#4169E1', 
            color: 'white',
            fontSize: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginLeft: '10px'
          }}
        >
          <FaCrown size={16} /> Official
        </span>
      )
    }
    if (recipe.isAccepted) {
      return (
        <span 
          className="badge" 
          style={{ 
            backgroundColor: '#28a745', 
            color: 'white',
            fontSize: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginLeft: '10px'
          }}
        >
          <FaCheckCircle size={16} /> Verified
        </span>
      )
    }
    return null
  }

  const isLiked = recipe?.likes?.some(like => 
    typeof like === 'object' ? like._id === currentUserId : like === currentUserId
  )

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Afficher la liste des personnes qui ont liké
  const showLikesList = () => {
    if (!recipe.likes || recipe.likes.length === 0) {
      Swal.fire({
        title: 'No likes yet',
        text: 'Be the first to like this recipe!',
        icon: 'info'
      })
      return
    }
    setShowLikesModal(true)
  }

  if (loading) {
    return (
      <div className="container text-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h2 className="mt-4">Loading recipe...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger" role="alert">
          <h4>Error loading recipe</h4>
          <p>{error}</p>
        </div>
        <button onClick={() => navigate("/")} className="btn-get-started mt-3">
          Back to Home
        </button>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container text-center py-5">
        <h2>Recipe not found</h2>
        <button onClick={() => navigate("/")} className="btn-get-started mt-3">
          Back to Home
        </button>
      </div>
    )
  }

  const ingredientsArray = getIngredientsArray(recipe.ingredients)

  return (
    <>
      <section className="section" style={{ paddingTop: '80px' }}>
        <div className="container">
          {/* Header */}
          <div className="section-title">
            <h2 style={{ fontWeight: "bold", fontSize: "2.2rem" }}>
              {recipe.title}
              {getRecipeBadge()}
            </h2>
            <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
              <span className="badge bg-primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                ⏱️ {recipe.time}
              </span>
              {recipe.createdBy && (
                <span className="badge bg-secondary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  👤 {getUserFullName(recipe.createdBy)}
                </span>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-6 col-md-8 col-sm-10">
              <img
                src={`http://localhost:5000/images/${recipe.coverImage}`}
                alt={recipe.title}
                className="img-fluid rounded shadow-lg"
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'cover',
                  borderRadius: '15px'
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="row gy-4">
            {/* Ingredients */}
            <div className="col-lg-5">
              <div className="card h-100 shadow-sm" style={{ borderRadius: '10px' }}>
                <div className="card-body">
                  <h3 className="card-title mb-4" style={{ color: '#ce1212' }}>
                    🛒 Ingredients
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, fontSize: '16px' }}>
                    {ingredientsArray.map((ing, i) => (
                      <li
                        key={i}
                        style={{
                          marginBottom: '12px',
                          paddingLeft: '25px',
                          position: 'relative',
                          lineHeight: '1.6'
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            color: '#28a745',
                            fontSize: '18px'
                          }}
                        >
                          ✓
                        </span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="col-lg-7">
              <div className="card h-100 shadow-sm" style={{ borderRadius: '10px' }}>
                <div className="card-body">
                  <h3 className="card-title mb-4" style={{ color: '#ce1212' }}>
                    📝 Instructions
                  </h3>
                  <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '16px' }}>
                    {recipe.instructions}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactions (Likes & Comments) */}
          <div className="row mt-5">
            <div className="col-12">
              {/* Likes & Comments Stats */}
              <div className="d-flex justify-content-center gap-4 mb-4">
                <button 
                  onClick={handleLike}
                  className={`btn ${isLiked ? 'btn-danger' : 'btn-outline-danger'} d-flex align-items-center gap-2`}
                  style={{ fontSize: '1.1rem', padding: '10px 20px' }}
                >
                  {isLiked ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                  <span>{recipe.likes?.length || 0} Likes</span>
                </button>

                <button
                  onClick={showLikesList}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  style={{ fontSize: '1.1rem', padding: '10px 20px' }}
                >
                  <FaUser size={18} />
                  <span>View Likes</span>
                </button>
                
                <div 
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  style={{ fontSize: '1.1rem', padding: '10px 20px', cursor: 'default' }}
                >
                  <FaComment size={20} />
                  <span>{recipe.comments?.length || 0} Comments</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="card shadow-sm" style={{ borderRadius: '10px' }}>
                <div className="card-body">
                  <h3 className="mb-4" style={{ color: '#ce1212' }}>
                    💬 Comments ({recipe.comments?.length || 0})
                  </h3>

                  {/* Add Comment Form */}
                  {token ? (
                    <form onSubmit={handleAddComment} className="mb-4">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Add a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          style={{ borderRadius: '8px 0 0 8px' }}
                        />
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          style={{ borderRadius: '0 8px 8px 0' }}
                        >
                          Post
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="alert alert-info mb-4 text-center">
                      <button 
                        onClick={() => handleAuthRequired("comment")}
                        className="btn btn-sm btn-primary"
                      >
                        Sign in to comment
                      </button>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="comments-list">
                    {recipe.comments?.length === 0 ? (
                      <p className="text-muted text-center py-3">
                        No comments yet. Be the first to comment!
                      </p>
                    ) : (
                      recipe.comments?.map((comment) => {
                        const commentUserImage = comment.user?.image 
                          ? `http://localhost:5000/images/profiles/${comment.user.image}`
                          : null
                        
                        return (
                          <div 
                            key={comment._id} 
                            className="card mb-3"
                            style={{ backgroundColor: '#f8f9fa' }}
                          >
                            <div className="card-body">
                              <div className="d-flex gap-3">
                                {/* Photo de profil */}
                                <div style={{ minWidth: '50px' }}>
                                  {commentUserImage ? (
                                    <img
                                      src={commentUserImage}
                                      alt="Profile"
                                      className="rounded-circle"
                                      style={{ 
                                        width: '50px', 
                                        height: '50px',
                                        objectFit: 'cover',
                                        border: '2px solid #ce1212'
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                                      style={{ width: '50px', height: '50px' }}
                                    >
                                      <FaUser size={22} style={{ color: 'white' }} />
                                    </div>
                                  )}
                                </div>

                                {/* Contenu du commentaire */}
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                      <strong style={{ color: '#ce1212' }}>
                                        {comment.user?.firstName} {comment.user?.lastName}
                                      </strong>
                                      {comment.isEdited && (
                                        <small className="text-muted ms-2">(edited)</small>
                                      )}
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                      <small className="text-muted d-flex align-items-center gap-1">
                                        <IoTimeOutline size={14} />
                                        {formatDate(comment.createdAt)}
                                      </small>
                                      
                                      {currentUserId && comment.user?._id === currentUserId && (
                                        <div className="d-flex gap-2">
                                          <button
                                            onClick={() => {
                                              setEditingCommentId(comment._id)
                                              setEditingCommentText(comment.text)
                                            }}
                                            className="btn btn-sm btn-outline-primary"
                                          >
                                            <MdEdit />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteComment(comment._id)}
                                            className="btn btn-sm btn-outline-danger"
                                          >
                                            <MdDelete />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {editingCommentId === comment._id ? (
                                    <div className="mt-2">
                                      <input
                                        type="text"
                                        className="form-control mb-2"
                                        value={editingCommentText}
                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                      />
                                      <button
                                        onClick={() => handleEditComment(comment._id)}
                                        className="btn btn-sm btn-primary me-2"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(null)
                                          setEditingCommentText("")
                                        }}
                                        className="btn btn-sm btn-secondary"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="mb-0 mt-2">{comment.text}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-5 mb-5">
            <button
              onClick={() => navigate(-1)}
              className="btn-get-started"
              style={{ padding: '12px 30px' }}
            >
              ← Back
            </button>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <Modal onClose={() => setIsAuthModalOpen(false)}>
          <InputForm setIsOpen={() => {
            setIsAuthModalOpen(false)
            fetchRecipe() // Refresh après connexion
          }} />
        </Modal>
      )}

      {/* Likes List Modal */}
      {showLikesModal && (
        <Modal onClose={() => setShowLikesModal(false)}>
          <div className="p-4">
            <h3 className="mb-4" style={{ color: '#ce1212' }}>
              <FaHeart style={{ color: '#ff6b6b' }} /> People who liked this recipe
            </h3>
            <div className="list-group">
              {recipe.likes && recipe.likes.length > 0 ? (
                recipe.likes.map((like, index) => {
                  // Vérifier si l'image existe et n'est pas l'avatar par défaut
                  const hasCustomImage = typeof like === 'object' && 
                                        like.image && 
                                        like.image !== 'default-avatar.png'
                  
                  const userProfileImage = hasCustomImage 
                    ? `http://localhost:5000/images/profiles/${like.image}`
                    : null
                  
                  return (
                    <div 
                      key={index} 
                      className="list-group-item d-flex align-items-center gap-3"
                      style={{ border: 'none', borderBottom: '1px solid #dee2e6', padding: '15px' }}
                    >
                      {/* Afficher soit l'image, soit l'avatar par défaut, mais jamais les deux */}
                      {userProfileImage ? (
                        <img
                          src={userProfileImage}
                          alt="Profile"
                          className="rounded-circle"
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            minWidth: '50px',
                            objectFit: 'cover',
                            border: '2px solid #ce1212'
                          }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            minWidth: '50px'
                          }}
                        >
                          <FaUser size={22} style={{ color: 'white' }} />
                        </div>
                      )}
                      
                      <div>
                        <strong style={{ fontSize: '1.1rem' }}>
                          {typeof like === 'object' 
                            ? `${like.firstName || ''} ${like.lastName || ''}`.trim() || 'Anonymous'
                            : 'User'}
                        </strong>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-center text-muted py-3">No likes yet</p>
              )}
            </div>
            <div className="text-center mt-4">
              <button 
                onClick={() => setShowLikesModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}