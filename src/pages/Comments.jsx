import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

// Toaster (For notification)
import { notification } from "@/notification";

// Components
import Icon from "@/components/Icon";
import DotsLoader from "@/components/DotsLoader";
import CommentItem from "@/components/CommentItem";

// Images
import reloadIcon from "@/assets/images/icons/reload.svg";

// Services
import commentsService from "@/api/services/commentsService";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { updateComments } from "@/store/features/commentsSlice";

const Comments = () => {
  const dispatch = useDispatch();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRatingIndex, setActiveRatingIndex] = useState(0);
  const allComments = useSelector((state) => state.comments.data);
  const [filteredComments, setFilteredComments] = useState(allComments || []);

  const handleDeleteComment = (id) => {
    notification.promise(
      commentsService.deleteComment(id).then(() => {
        if (filteredComments.find(({ _id }) => _id === id)) {
          setFilteredComments((comments) =>
            comments.filter(({ _id }) => _id !== id)
          );
        }
      }),
      {
        loading: "Izoh o'chirilmoqda...",
        success: "Izoh muvaffaqiyatli o'chirildi!",
        error: "Izohni o'chirishda xatolik yuz berdi!",
      }
    );
  };

  const loadComments = () => {
    setHasError(false);
    setIsLoading(true);

    commentsService
      .getComments()
      .then((comments) => {
        setFilteredComments(comments);
        dispatch(updateComments(comments));
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  };

  const filterCommentsByRating = (rating = 0) => {
    const formattedRating = Number(rating);

    if (
      hasError ||
      isLoading ||
      formattedRating > 5 ||
      formattedRating <= 0 ||
      allComments?.length <= 0
    ) {
      return setActiveRatingIndex(0);
    }
    setActiveRatingIndex(formattedRating);

    if (formattedRating === activeRatingIndex) {
      setActiveRatingIndex(0);
      return setFilteredComments(allComments);
    }

    const filteredComments = allComments.filter(
      ({ rating }) => Number(rating) === formattedRating
    );

    setFilteredComments(filteredComments);
  };

  useEffect(() => {
    if (allComments?.length === 0) loadComments();
    else setTimeout(() => setIsLoading(false), 300);
  }, []);

  return (
    <div className="container py-6 space-y-7">
      <h1>
        <span>Izohlar</span>
        <span className="text-neutral-400"> ({allComments?.length || 0})</span>
      </h1>

      {/* Nav tabs */}
      <div className="flex justify-between w-full">
        <nav className="products-layout-tabs">
          <ul className="flex gap-1 max-w-max bg-white p-1 rounded-xl">
            {/* Main */}
            <li>
              <NavLink
                end
                to="/comments"
                className="inline-block py-2 px-5 rounded-lg text-[17px] text-neutral-500 transition-colors duration-200 hover:bg-gray-light/50"
              >
                Asosiy
              </NavLink>
            </li>

            {/* Product */}
            <li>
              <NavLink
                to="/comments/new-product"
                className="inline-block py-2 px-5 rounded-lg text-[17px] text-neutral-500 transition-colors duration-200 hover:bg-gray-light/50"
              >
                Yaratish
              </NavLink>
            </li>

            {/* Search */}
            <li>
              <NavLink
                to="/comments/search"
                className="inline-block py-2 px-5 rounded-lg text-[17px] text-neutral-500 transition-colors duration-200 hover:bg-gray-light/50"
              >
                Qidirish
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Filter comments by rating */}
        <ul className="products-layout-tabs flex gap-1 max-w-max bg-white p-1 rounded-xl">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index}>
              <button
                onClick={() => filterCommentsByRating(index + 1)}
                className={`${
                  activeRatingIndex === index + 1 ? "active" : ""
                } py-2 px-5 rounded-lg text-[17px] text-neutral-500 transition-colors duration-200 hover:bg-gray-light/50`}
              >
                {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Comments */}
      {!isLoading && !hasError && filteredComments?.length >= 0 && (
        <ul className="grid grid-cols-2 gap-5">
          {filteredComments.map((comment, index) => (
            <CommentItem
              key={index}
              data={comment}
              deleteComment={handleDeleteComment}
            />
          ))}
        </ul>
      )}

      {/* Loading animation */}
      {isLoading && !hasError && (
        <DotsLoader
          color="#0085FF"
          className="flex justify-center fixed top-1/2 inset-x-0 w-full"
        />
      )}

      {/* Reload button */}
      {hasError && !isLoading && (
        <div className="flex justify-center fixed top-[calc(50%-20px)] inset-x-0">
          <button
            title="Reload"
            aria-label="Reload"
            onClick={loadComments}
            className="flex items-center justify-center size-10"
          >
            <Icon src={reloadIcon} alt="Reload icon" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Comments;
