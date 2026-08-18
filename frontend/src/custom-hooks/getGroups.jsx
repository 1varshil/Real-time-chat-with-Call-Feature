import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Serverurl } from "../main";
import { appendGroups, setGroups } from "../redux/groupSlice";

const getGroups = () => {
  let dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const fetchGroups = async (page = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) dispatch(setLoadingMore(true));

      let response = await axios.get(`${Serverurl}/api/group/get-groups`, {
        params: { page, limit: 20 },
        withCredentials: true,
      });

      if (isLoadMore) {
        dispatch(appendGroups(response.data));
      } else {
        dispatch(setGroups(response.data));
      }
    } catch (error) {
      console.log("Error fetching others user: ", error);
    } finally {
      if (isLoadMore) dispatch(setLoadingMore(false));
    }
  };

  useEffect(() => {
    if (userData) {
      fetchGroups(1, false);
    }
  }, [dispatch, userData]);

  return { fetchMore: (page) => fetchGroups(page, true) };
};

export default getGroups;
