import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InPageNavigaion from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";

const SearchPage = () => {
  const { query } = useParams();
  const [blogs, setBlogs] = useState(null);
  const [users, setUsers] = useState(null);
  const searchBlog = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        query,
        page,
      })
      .then(async ({ data }) => {
        let formateData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-search-blogs-count",
          data_to_send: { query },
          create_new_arr,
        });
        setBlogs(formateData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchUsers = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
      .then(({ data : {users}}) => {
        setUsers(users);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    resetState();
    searchBlog({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  const UserCardWrapper = () => {
    return (
      <>
        {users === null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, i) => {
            return <AnimationWrapper key={i} transition={{duration: 1, delay: i * 0.08}}>
                <UserCard user={user}/>
            </AnimationWrapper>
          })
        ) : (
          <NoDataMessage message={"No User Found"} />
        )}
      </>
    );
  };
  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigaion
          routes={[`Search Results from "${query}`, "Account Matched"]}
          defaultHidden={["Account Matched"]}
        >
          <>
            {blogs === null ? (
              <Loader />
            ) : !blogs.results.length ? (
              <NoDataMessage message={"No blog published"} />
            ) : (
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
            <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlog} />
          </>
          <>
              <UserCardWrapper/>
          </>
        </InPageNavigaion>
      </div>
      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
        <h1 className="font-medium text-xl mb-8">Users Related to search <i className="fi fi-rr-user mt-1"></i></h1>
        <UserCardWrapper/>

      </div>
    </section>
  );
};

export default SearchPage;
