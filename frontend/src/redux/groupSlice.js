import { createSlice } from "@reduxjs/toolkit";

export const GroupSlice = createSlice({
    name: "group",
    initialState: {
        groups: []
    },
    reducers: {
        setGroups: (state, action) => {
            state.groups = action.payload;
        },
        appendGroups: (state, action) => {
            state.groups.push(action.payload);
        },
        setLoadingMore: (state, action) => {
            state.pagination.loading = action.payload;
        },
        clearGroupUnreadCount: (state, action) => {
            const groupId = action.payload;
            const group = state.groups.find((g) => g._id === groupId);
            if (group) group.unreadCount = 0;
        },
        incrementGroupUnreadCount: (state, action) => {
            const groupId = action.payload;
            const group = state.groups.find((g) => g._id === groupId);
            if (group) {
                group.unreadCount = (group.unreadCount || 0) + 1;
            }
        }
    }
})

export const {
    setGroups,
    appendGroups,
    setLoadingMore,
    clearGroupUnreadCount,
    incrementGroupUnreadCount
} = GroupSlice.actions;
export default GroupSlice.reducer;