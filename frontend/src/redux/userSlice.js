import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        otherUsers: [],
        pagination: {
            page: 1,
            hasMore: true,
            loading: false
        }
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        setOtherUsers: (state, action) => {
            state.otherUsers = action.payload.users || [];
            state.pagination.hasMore = action.payload.hasMore;
            state.pagination.page = 1;
        },
        appendOtherUsers: (state, action) => {
            state.otherUsers = [...state.otherUsers, ...(action.payload.users || [])];
            state.pagination.hasMore = action.payload.hasMore;
            state.pagination.page += 1;
        },
        setLoadingMore: (state, action) => {
            state.pagination.loading = action.payload;
        },
        addNewUser: (state, action) => {
            // Only add if not already in the list
            const exists = state.otherUsers.some(user => user._id === action.payload._id);
            if (!exists) {
                state.otherUsers.unshift(action.payload); // Add to the top of the list
            }
        },
        clearUnreadCount: (state, action) => {
            const userId = action.payload;
            const user = state.otherUsers.find((u) => u._id === userId);
            if (user) user.unreadCount = 0;
        },
        incrementUnreadCount: (state, action) => {
            const userId = action.payload;
            const user = state.otherUsers.find((u) => u._id === userId);
            if (user) {
                user.unreadCount = (user.unreadCount || 0) + 1;
            }
        }
    }
})

export const {
    setUserData,
    setOtherUsers,
    appendOtherUsers,
    setLoadingMore,
    addNewUser,
    clearUnreadCount,
    incrementUnreadCount
} = userSlice.actions;
export default userSlice.reducer;