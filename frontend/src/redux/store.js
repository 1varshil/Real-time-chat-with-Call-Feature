import {configureStore} from "@reduxjs/toolkit";
import pizza from "./userSlice.js"
import groupSlice from "./groupSlice.js";
import callSlice from "./callSlice.js";
const store = configureStore({
    reducer:{
       user : pizza,
       group: groupSlice,
       call: callSlice,
    }
})

export default store;
