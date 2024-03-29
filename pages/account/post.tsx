import { GlobalHead } from "components/GlobalHead";
import Layout from "components/Layout";
import { CustomNextPage } from "components/CustomNextPage";
import { useState } from "react";
import axios from "lib/axios";
import { useRouter } from "next/router";
import { onTagInput } from "lib/shared";
import { postType, PostType } from "lib/types";
import RoundXIcon from "../../components/RoundXIcon";

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const imageLimit = 150;

const Post: CustomNextPage = () => {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [postSetting, setPostSetting] = useState<PostType>("TEXT");
  const [content, setContent] = useState<string>("");
  const [imageList, setImageList] = useState<FileList | null>();
  const [video, setVideo] = useState<File | null>();
  const [unlisted, setUnlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [finishedUpload, setFinishedUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileNames, setFileNames] = useState<string[]>([]);

  return (
    <>
      <GlobalHead />
      <Layout>
        <main className="container flex-grow p-2">
          <h1 className="text-2xl font-bold">Create Post</h1>
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
              switch (postSetting) {
                case "TEXT": {
                  if (content && content.length > 0) {
                    formData.set("content", content);
                  } else return;
                  break;
                }
                case "IMAGES": {
                  if (imageList) {
                    for (let i = 0; i < imageList.length; i++) {
                      formData.append("image", imageList[i], imageList[i].name);
                    }
                  } else return;
                  break;
                }
                case "VIDEO": {
                  if (video) {
                    formData.append("video", video);
                  } else return;
                  break;
                }
              }
              formData.set("type", postSetting.toUpperCase());
              formData.set("tags", tags.join(","));
              formData.set("unlisted", unlisted ? "true" : "false");

              setIsLoading(true);
              axios
                .put("/post", formData, {
                  headers: {
                    "Content-Type": "multipart/form-data"
                  },
                  maxBodyLength: 104857780,
                  onUploadProgress: (progressEvent) => {
                    const { loaded, total } = progressEvent;
                    if (!total) {
                      return;
                    }

                    setProgress(Math.round((loaded * 100) / total));
                    if (loaded === total) {
                      setFinishedUpload(true);
                    }
                  }
                })
                .then((res) => {
                  setIsLoading(false);
                  setFinishedUpload(false);
                  setError(null);
                  router.push("/post/[id]", `/post/${res.data.postId}`);
                })
                .catch((res) => {
                  setIsLoading(false);
                  setFinishedUpload(false);
                  if (res.response.data.message) {
                    setError(res.response.data.message);
                  } else setError(res.response.data);
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
                placeholder="The worst puns on the internet"
                className="input input-bordered"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Post type</span>
              </label>
              <select
                className="select select-bordered w-full max-w-xs"
                defaultValue={postSetting}
                onChange={(e) =>
                  setPostSetting(e.currentTarget.value as PostType)
                }
              >
                {postType.map((type, index) => (
                  <option key={index} value={type}>
                    {capitalizeFirstLetter(type.toLowerCase())}
                  </option>
                ))}
              </select>
            </div>

            {postSetting === "TEXT" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Content</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  onInput={(e) => setContent(e.currentTarget.value)}
                  required
                  maxLength={1000}
                  placeholder="Today I drank a bottle of water... A bo'oh'o'wa'er"
                ></textarea>
              </div>
            )}
            {postSetting === "IMAGES" && (
              <div className="form-control max-w-md">
                <label className="label">
                  <span className="label-text">Images</span>
                  <span className="label-text-alt">
                    ({imageLimit} max, 5MB per image)
                  </span>
                </label>
                <div className="flex w-full items-center justify-center">
                  <label
                    className="min-h-32 flex w-full flex-col rounded border-4 border-dashed border-primary hover:bg-base-300">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-400 group-hover:text-gray-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                        Select images
                      </p>
                      {fileNames && (
                        <ul
                          className="mt-2 flex list-decimal flex-col pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                          {fileNames.map((name, index) => (
                            <li key={index}>{name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={({ target }) => {
                        const imageList = target.files;
                        if (imageList) {
                          if (imageList.length > imageLimit) {
                            setError(
                              `You can only upload ${imageLimit} images`
                            );
                            return;
                          }
                          setImageList(imageList);

                          const fileNames: string[] = [];
                          for (let i = 0; i < imageList.length; i++) {
                            const file = imageList[i];
                            fileNames.push(file.name);
                          }
                          setFileNames(fileNames);
                        }
                      }}
                      required
                      className="opacity-0"
                    />
                  </label>
                </div>
              </div>
            )}
            {postSetting === "VIDEO" && (
              <div className="form-control max-w-md">
                <label className="label">
                  <span className="label-text">Video</span>
                  <span className="label-text-alt">(50MB max)</span>
                </label>
                <div className="flex w-full items-center justify-center">
                  <label
                    className="min-h-32 flex w-full flex-col rounded border-4 border-dashed border-primary hover:bg-base-300">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-400 group-hover:text-gray-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                        Select a video
                      </p>
                      {video && (
                        <p
                          className="mt-2 flex flex-col pt-1 text-center text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                          {video.name}
                        </p>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="video/mp4,video/mov,video/webm,video/mpeg,video/mpg,video/avi"
                      onChange={({ target }) =>
                        setVideo(target.files ? target.files[0] : null)
                      }
                      required
                      className="opacity-0"
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Tags</span>
              </label>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <button
                    onClick={() => setTags(tags.filter((tag2) => tag2 !== tag))}
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
              </div>
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
                  className="checkbox checkbox-primary"
                />
              </label>
            </div>

            {isLoading ? (
              <button className="btn btn-primary no-animation mt-6">
                <span className="loading loading-spinner"></span>
                {finishedUpload ? "Processing" : <>Submitting {progress}%</>}
              </button>
            ) : (
              <input
                type="submit"
                className="btn btn-primary mt-6"
                value="Submit"
              />
            )}
          </form>
        </main>
      </Layout>
    </>
  );
};

Post.auth = true;

// noinspection JSUnusedGlobalSymbols
export default Post;
