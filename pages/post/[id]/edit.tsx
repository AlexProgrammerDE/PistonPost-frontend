import { CustomNextPage } from "components/CustomNextPage";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { GlobalHead } from "components/GlobalHead";
import Layout from "components/Layout";
import axios from "lib/axios";
import { onTagInput } from "lib/shared";
import LoadingView from "components/LoadingView";
import { ImageResponse, PostResponse, VideoResponse } from "lib/responses";
import { PostType } from "lib/types";
import RoundXIcon from "../../../components/RoundXIcon";

const PostEdit: CustomNextPage = () => {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [postSetting, setPostSetting] = useState<PostType>("TEXT");
  const [content, setContent] = useState<string | null>();
  const [unlisted, setUnlisted] = useState(false);
  const [imageList, setImageList] = useState<ImageResponse[] | null>();
  const [video, setVideo] = useState<VideoResponse | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id } = router.query;
  const [post, setPost] = useState<PostResponse>();

  useEffect(() => {
    if (id && router) {
      axios
        .get(`/post/${id}`)
        .then((res) => {
          const post: PostResponse = res.data;

          setTitle(post.title);
          setPostSetting(post.type);
          switch (post.type) {
            case "TEXT":
              setContent(post.content!);
              break;
            case "IMAGES":
              setImageList(post.images!);
              break;
            case "VIDEO":
              setVideo(post.video!);
              break;
          }
          setTags(post.tags);
          setUnlisted(post.unlisted);
          setPost(post);
        })
        .catch((err) => {
          console.error(err);
          router.push("/").then();
        });
    }
  }, [id, router]);

  if (id && post) {
    const deletePost = () => {
      fetch(`/backend/post/${id}`, {method: "DELETE"}).then(() => {
        router.push("/").then();
      });
    };

    return (
      <>
        <GlobalHead />
        <Layout>
          <main className="container flex-grow p-2">
            <h1 className="text-2xl font-bold">Edit Post</h1>
            {error && (
              <div className="alert alert-error my-3 shadow-lg">
                <div className="flex flex-wrap">
                  <RoundXIcon/>
                  <span>{error}</span>
                </div>
              </div>
            )}
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (isLoading) {
                  return;
                }

                const formData = new FormData(e.currentTarget);

                formData.set("title", title);

                if (content) formData.set("content", content);

                formData.set("tags", tags.join(","));
                formData.set("unlisted", unlisted ? "true" : "false");

                setIsLoading(true);
                axios
                  .put(`/post/${id}`, formData, {
                    headers: {
                      "Content-Type": "multipart/form-data"
                    }
                  })
                  .then(() => {
                    setIsLoading(false);
                    setError(null);
                    router.push(`/post/${id}`).then();
                  })
                  .catch((res) => {
                    setIsLoading(false);
                    setError(`${res.response.data.message}`);
                  });
              }}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  required
                  maxLength={100}
                  defaultValue={title}
                  placeholder="The worst puns on the internet"
                  className="input input-bordered"
                />
              </div>

              {postSetting === "TEXT" && content && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Content</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    onInput={(e) => setContent(e.currentTarget.value)}
                    required
                    maxLength={1000}
                    defaultValue={content}
                    placeholder="Today I drank a bottle of water... A bo'oh'o'wa'er"
                  ></textarea>
                </div>
              )}
              {postSetting === "IMAGES" && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Images</span>
                  </label>
                  <ul className="ml-4 list-decimal">
                    {imageList &&
                      imageList.map((image, index) => (
                        <li key={index}>
                          <a
                            className="link"
                            href={`/backend/static/images/${image.id}.${image.extension}`}
                          >
                            {image.id}.{image.extension}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              {postSetting === "VIDEO" && video && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Video</span>
                  </label>
                  <a
                    href={`/backend/static/videos/${video.id}.${video.extension}`}
                    className="link"
                  >
                    {video.id}.{video.extension}
                  </a>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <label className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <button
                      onClick={() =>
                        setTags(tags.filter((tag2) => tag2 !== tag))
                      }
                      key={tag}
                      className="btn normal-case duration-500 hover:btn-error"
                    >
                      #{tag}
                    </button>
                  ))}
                  <input
                    type="text"
                    placeholder="Comedy"
                    maxLength={20}
                    onKeyDown={(e) => onTagInput(e, setTags, tags)}
                    className="input input-bordered"
                  />
                </label>
                <label className="label">
                  <span className="label-text-alt">
                    Press enter do add a tag (5 max)
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label max-w-[12rem] cursor-pointer">
                  <span className="label-text">Unlisted</span>
                  <input
                    type="checkbox"
                    onChange={(e) => setUnlisted(e.currentTarget.checked)}
                    defaultChecked={unlisted}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>

              {isLoading ? (
                <button className="btn btn-primary no-animation mt-6">
                  <span className="loading loading-spinner"></span>
                  Processing
                </button>
              ) : (
                <input
                  type="submit"
                  className="btn btn-primary mt-6"
                  value="Edit"
                />
              )}
            </form>
            <label
              htmlFor="delete-modal"
              className="modal-button btn btn-error mt-6"
            >
              Delete Post
            </label>
            <input type="checkbox" id="delete-modal" className="modal-toggle" />
            <div className="modal" id="delete-modal">
              <div className="modal-box">
                <h3 className="text-lg font-bold">
                  Do you really want to delete this post?
                </h3>
                <p className="py-4">
                  This action will delete the entire post and all comments.
                </p>
                <div className="modal-action">
                  <label htmlFor="delete-modal" className="btn btn-primary">
                    NO
                  </label>
                  <label
                    onClick={deletePost}
                    htmlFor="delete-modal"
                    className="btn btn-error"
                  >
                    YES
                  </label>
                </div>
              </div>
            </div>
          </main>
        </Layout>
      </>
    );
  } else {
    return <LoadingView />;
  }
};

PostEdit.auth = true;

// noinspection JSUnusedGlobalSymbols
export default PostEdit;
