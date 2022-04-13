import type {NextPage} from 'next'
import {GlobalHead} from "../components/GlobalHead";
import Layout from "../components/Layout";
import {useEffect, useState} from "react";
import LoadingView from "../components/LoadingView";
import axios from "../lib/axios";
import {PostData} from "./post/[id]";
import Link from "next/link";
import ReactTimeAgo from "react-time-ago";

const Home: NextPage = () => {
  const [frontData, setFrontData] = useState<PostData[]>();

  useEffect(() => {
    if (!frontData) {
      axios.get('/home').then(res => {
        setFrontData(res.data)
      })
    }
  }, [frontData])

  if (frontData) {
    return (
        <>
          <GlobalHead/>
          <Layout>
            <div className="p-6 container">
              <h1 className="text-2xl font-bold">Recent posts...</h1>
              <div className="w-full flex flex-wrap justify-center">
                {frontData.map((post, index) => (
                    <div className="card w-96 bg-base-200 shadow-xl m-2" key={index}>
                      <div className="card-body">
                        <Link href={'/post/' + post.postId}>
                          <a>
                            <h2 className="card-title">
                              {post.title}
                            </h2>
                          </a>
                        </Link>

                        <div className="card-actions justify-between">
                          <span><span><ReactTimeAgo date={post.timestamp}/></span></span>
                          <div className="card-actions">
                            {post.tags.map((tag, index) => (
                                <Link href={'/tag/' + tag} key={index}>
                                  <a className="my-auto badge badge-outline">
                                    {tag}
                                  </a>
                                </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </Layout>
        </>
    )
  } else {
    return <LoadingView/>
  }
}

// noinspection JSUnusedGlobalSymbols
export default Home
