import axios from "axios";
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Serverurl } from "../main";
import { setOtherUsers } from "../redux/userSlice";

import { setLoadingMore, appendOtherUsers } from "../redux/userSlice";

const getOtherUsers = () => {
    let dispatch = useDispatch();
    const { userData } = useSelector((state) => state.user);

    const fetchUsers = async (page = 1, isLoadMore = false) => {
        try {
            if (isLoadMore) dispatch(setLoadingMore(true));
            
            let response = await axios.get(`${Serverurl}/api/user/other-users`, {
                params: { page, limit: 20 },
                withCredentials: true
            });

            if (isLoadMore) {
                dispatch(appendOtherUsers(response.data));
            } else {
                dispatch(setOtherUsers(response.data));
            }
        } catch (error) {
            console.log("Error fetching others user: ", error);
        } finally {
            if (isLoadMore) dispatch(setLoadingMore(false));
        }
    }

    useEffect(() => {
        if (userData) {
            fetchUsers(1, false);
        }
    }, [dispatch, userData]);

    return { fetchMore: (page) => fetchUsers(page, true) };
}

export default getOtherUsers;