import React, { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigaion, { activeTabRef } from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimulBlogPost from "../components/nobanner-blog-post.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const Home = () => {
  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState('home')
  let categories = [
    "programming",
    "hollywood",
    "food",
    "future",
    "cooking",
    "tech",
    "travel",
  ];
  const fetchLatestBlogs = ({page = 1}) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blog", {page})
      .then( async ({ data }) => {
        // console.log(data.blogs)
        let formateData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: '/all-latest-blogs-count'
        })
        // console.log(formateData)
        setBlogs(formateData)
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blog")
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchBlogByCategory = ({page = 1}) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {tag: pageState, page})
      .then( async({ data }) => {
        let formateData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: '/all-search-blogs-count',
          data_to_send: {tag: pageState}
        })
        // console.log(formateData)
        setBlogs(formateData)
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const loadBlogbyCategory = (e) =>{
    let category = e.target.innerText.toLowerCase();
    setBlogs(null)

    if(pageState === category){
        setPageState('home');
        return;
    }
    setPageState(category)
  }
  useEffect(() => {
    activeTabRef.current.click()
    if(pageState === 'home')
        fetchLatestBlogs({page: 1});
    else{
        fetchBlogByCategory({page: 1})
    }
    if(!trendingBlogs)
        fetchTrendingBlogs();
  }, [pageState]);
  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* latest blog */}
        <div className="w-full">
          <InPageNavigaion
            routes={[pageState, "trending blog"]}
            defaultHidden={["trending blog"]}
          >
            <>
              {blogs === null ? (
                <Loader />
              ) : (
                !blogs.results.length ? <NoDataMessage message={'No blog published'}/> : 
                blogs.results.map((blog, i) => {
                    return (
                      <AnimationWrapper
                        key={i}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      >
                        <BlogPostCard
                          content={blog}
                          author={blog.author.personal_info}
                        />
                      </AnimationWrapper>
                    );
                  })
              )}
              <LoadMoreDataBtn state={blogs} fetchDataFun={(pageState === 'home' ? fetchLatestBlogs : fetchBlogByCategory )}/>
            </>
            {trendingBlogs === null ? (
              <Loader />
            ) : (
              trendingBlogs.length ? 
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    key={i}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  >
                    <MinimulBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                )
              })
              : <NoDataMessage message={'No blog Trending'}/> 
            )}
          </InPageNavigaion>
        </div>
        {/* filter and trending */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
            <div className="flex flex-col gap-10">
                <div>
                    <h1 className="font-medium text-xl mb-8">
                        Stories from all interest
                    </h1>
                    <div className="flex gap-3 flex-wrap">
                        {categories.map((category, i) => {
                        return (
                            <button onClick={loadBlogbyCategory} key={i} className={"tag " + (pageState === category ? "bg-black text-white" : "") }>
                            {category}
                            </button>
                        );
                        })}
                    </div>
                </div>

                <div>
                    <h1 className="text-xl font-medium mb-8">
                        Trending <i className="fi fi-rr-arrow-trend-up"></i>
                    </h1>
                    {trendingBlogs === null ? (
                        <Loader />
                    ) : (
                        trendingBlogs.length ? 
                        trendingBlogs.map((blog, i) => {
                        return (
                            <AnimationWrapper
                            key={i}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            >
                            <MinimulBlogPost blog={blog} index={i} />
                            </AnimationWrapper>
                        );
                        })
                        : <NoDataMessage message={'No blog Trending'}/> 
                    )}
                </div>
            </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default Home;
