import { NextPage } from "next";
import { GlobalHead } from "../../components/GlobalHead";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import LoadingView from "../../components/LoadingView";
import PostCard from "../../components/PostCard";
import { PostResponse } from "../../lib/responses";
import Masonry from "react-masonry-css";
import { breakpointColumnsObj } from "../../lib/shared";

const Post: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [posts, setPosts] = useState<PostResponse[]>();

  useEffect(() => {
    if (id) {
      axios.get(`/tag/${id}`).then((res) => {
        setPosts(res.data);
      });
    }
  }, [id]);

  if (posts) {
    return (
      <>
        <GlobalHead />
        <Layout>
          <div className="container flex-grow p-6">
            <h1 className="text-2xl font-bold mx-2">
              Showing posts tagged with &quot;{id}&quot;
            </h1>
            {posts.length > 0 ? (
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid h-full w-full"
                columnClassName="my-masonry-grid_column"
              >
                {posts.map((post, index) => (
                  <PostCard key={index} post={post} />
                ))}
              </Masonry>
            ) : (
              <div className="flex h-full w-full justify-center">
                <h3 className="m-auto text-3xl font-bold">
                  No posts with this tag found... :(
                </h3>
              </div>
            )}
          </div>
        </Layout>
      </>
    );
  } else {
    return <LoadingView />;
  }
};

// noinspection JSUnusedGlobalSymbols
export default Post;
