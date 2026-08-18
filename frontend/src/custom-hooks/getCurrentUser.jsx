import axios from "axios";
import { useEffect } from "react"
import { useDispatch, } from "react-redux"
import { Serverurl } from "../main";
import { setUserData } from "../redux/userSlice";


const useCurrentUser = () => {
    let dispatch = useDispatch();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                let user = await axios.get(`${Serverurl}/api/user/current`, {
                    withCredentials: true
                });
                dispatch(setUserData(user.data));
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 401) {
                        return;
                    }
                }
                console.log("Error fetching current user: ", error);
            }
        }
        fetchUser();
    }, [dispatch]);
}

export default useCurrentUser;