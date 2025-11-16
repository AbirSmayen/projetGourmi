import React, { useEffect, useState } from "react";
import axios from "axios";

const Interactions = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, comments, likes
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const { data } = await axios.get("http://localhost:5000/api/admin/recipes", {
        headers: { authorization: `bearer ${token}` }
      });
      setRecipes(data.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (recipeId, commentId, recipeTitle) => {
    if (window.confirm(`Delete this comment from the recipe "${recipeTitle}" ?`)) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete(
          `http://localhost:5000/api/admin/recipes/${recipeId}/comment/${commentId}`,
          {
            headers: { authorization: `bearer ${token}` }
          }
        );
        alert("Comment deleted successfully");
        fetchRecipes();
      } catch (error) {
        console.error("Error:", error);
        alert("Error deleting comment");
      }
    }
  };

  const handleRemoveLike = async (recipeId, userId, recipeTitle) => {
    if (window.confirm(`Remove this like from the recipe "${recipeTitle}" ?`)) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete(
          `http://localhost:5000/api/admin/recipes/${recipeId}/like/${userId}`,
          {
            headers: { authorization: `bearer ${token}` }
          }
        );
        alert("Like removed successfully");
        fetchRecipes();
      } catch (error) {
        console.error("Error:", error);
        alert("Error removing like");
      }
    }
  };

  const getUserName = (user) => {
    if (!user) return "Anonymous";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Anonymous";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const toggleExpand = (recipeId) => {
    setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
  };

  // Filter recipes
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "comments") {
      return matchesSearch && recipe.comments?.length > 0;
    }
    if (filterType === "likes") {
      return matchesSearch && recipe.likes?.length > 0;
    }
    return matchesSearch;
  });

  // Compute statistics
  const totalComments = recipes.reduce((sum, r) => sum + (r.comments?.length || 0), 0);
  const totalLikes = recipes.reduce((sum, r) => sum + (r.likes?.length || 0), 0);
  const recipesWithComments = recipes.filter(r => r.comments?.length > 0).length;
  const recipesWithLikes = recipes.filter(r => r.likes?.length > 0).length;

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Interaction Management</h1>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Comments
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {totalComments}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    On {recipesWithComments} recipes
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-comments fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Likes
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {totalLikes}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    On {recipesWithLikes} recipes
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-heart fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Avg Comments/Recipe
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {recipes.length > 0 ? (totalComments / recipes.length).toFixed(1) : 0}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-chart-line fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Avg Likes/Recipe
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {recipes.length > 0 ? (totalLikes / recipes.length).toFixed(1) : 0}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-star fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & search */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h6 className="m-0 font-weight-bold text-primary">
                Interactions per Recipe ({filteredRecipes.length})
              </h6>
            </div>
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-6 mb-2 mb-md-0">
                  <select
                    className="form-control"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All interactions</option>
                    <option value="comments">With comments</option>
                    <option value="likes">With likes</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search a recipe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <p className="text-center text-muted py-4">No recipes found</p>
          ) : (
            <div className="accordion" id="recipesAccordion">
              {filteredRecipes.map((recipe) => (
                <div key={recipe._id} className="card mb-3">
                  <div className="card-header" id={`heading-${recipe._id}`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        <h5 className="mb-1">
                          <button
                            className="btn btn-link text-left"
                            onClick={() => toggleExpand(recipe._id)}
                            style={{ textDecoration: "none", color: "#4e73df" }}
                          >
                            <i className={`fas fa-chevron-${expandedRecipe === recipe._id ? 'down' : 'right'} mr-2`}></i>
                            {recipe.title}
                          </button>
                        </h5>
                      </div>
                      <div className="d-flex gap-3">
                        <span className="badge badge-info badge-pill">
                          <i className="fas fa-comment"></i> {recipe.comments?.length || 0}
                        </span>
                        <span className="badge badge-danger badge-pill">
                          <i className="fas fa-heart"></i> {recipe.likes?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {expandedRecipe === recipe._id && (
                    <div className="card-body">
                      {/* Comments */}
                      {recipe.comments && recipe.comments.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-primary mb-3">
                            <i className="fas fa-comments"></i> Comments ({recipe.comments.length})
                          </h6>
                          <div className="table-responsive">
                            <table className="table table-sm table-hover">
                              <thead>
                                <tr>
                                  <th>User</th>
                                  <th>Comment</th>
                                  <th>Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recipe.comments.map((comment) => (
                                  <tr key={comment._id}>
                                    <td>
                                      <strong>{getUserName(comment.user)}</strong>
                                    </td>
                                    <td>
                                      {comment.text}
                                      {comment.isEdited && (
                                        <span className="badge badge-secondary ml-2">Edited</span>
                                      )}
                                    </td>
                                    <td className="text-muted small">
                                      {formatDate(comment.createdAt)}
                                    </td>
                                    <td>
                                      <button
                                        onClick={() => handleDeleteComment(recipe._id, comment._id, recipe.title)}
                                        className="btn btn-danger btn-sm"
                                        title="Delete this comment"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Likes */}
                      {recipe.likes && recipe.likes.length > 0 && (
                        <div>
                          <h6 className="text-danger mb-3">
                            <i className="fas fa-heart"></i> Likes ({recipe.likes.length})
                          </h6>
                          <div className="table-responsive">
                            <table className="table table-sm table-hover">
                              <thead>
                                <tr>
                                  <th>User</th>
                                  <th>Email</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recipe.likes.map((user) => (
                                  <tr key={user._id}>
                                    <td>
                                      <strong>{getUserName(user)}</strong>
                                    </td>
                                    <td className="text-muted">{user.email || "N/A"}</td>
                                    <td>
                                      <button
                                        onClick={() => handleRemoveLike(recipe._id, user._id, recipe.title)}
                                        className="btn btn-warning btn-sm"
                                        title="Remove this like"
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {(!recipe.comments || recipe.comments.length === 0) &&
                       (!recipe.likes || recipe.likes.length === 0) && (
                        <p className="text-muted text-center py-3">
                          No interaction on this recipe
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interactions;
