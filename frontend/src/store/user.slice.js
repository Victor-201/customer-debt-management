import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userApi from "@/api/user.api";

/* =======================
   ASYNC THUNKS
======================= */

// Lấy danh sách users
export const fetchUsers = createAsyncThunk(
    "user/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await userApi.getAll();
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Lấy danh sách users đã xóa
export const fetchDeletedUsers = createAsyncThunk(
    "user/fetchDeleted",
    async (_, { rejectWithValue }) => {
        try {
            const res = await userApi.getDeleted();
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Lấy user theo ID
export const fetchUserById = createAsyncThunk(
    "user/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await userApi.getById(id);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Tạo user mới
export const createUser = createAsyncThunk(
    "user/create",
    async (data, { rejectWithValue }) => {
        try {
            const res = await userApi.create(data);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Cập nhật user
export const updateUser = createAsyncThunk(
    "user/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await userApi.update(id, data);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Lock user
export const lockUser = createAsyncThunk(
    "user/lock",
    async (id, { rejectWithValue }) => {
        try {
            const res = await userApi.lock(id);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Unlock user
export const unlockUser = createAsyncThunk(
    "user/unlock",
    async (id, { rejectWithValue }) => {
        try {
            const res = await userApi.unlock(id);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Soft delete user
export const softDeleteUser = createAsyncThunk(
    "user/softDelete",
    async (id, { rejectWithValue }) => {
        try {
            await userApi.softDelete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Restore user
export const restoreUser = createAsyncThunk(
    "user/restore",
    async (id, { rejectWithValue }) => {
        try {
            const res = await userApi.restore(id);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Hard delete user
export const hardDeleteUser = createAsyncThunk(
    "user/hardDelete",
    async (id, { rejectWithValue }) => {
        try {
            await userApi.hardDelete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/* =======================
   SLICE
======================= */

const userSlice = createSlice({
    name: "user",
    initialState: {
        list: [],
        deletedList: [],
        selectedUser: null,
        loading: false,
        error: null,
    },

    reducers: {
        clearSelectedUser(state) {
            state.selectedUser = null;
        },
        clearError(state) {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            // FETCH ALL
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH DELETED
            .addCase(fetchDeletedUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDeletedUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedList = action.payload;
            })
            .addCase(fetchDeletedUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FETCH BY ID
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.selectedUser = action.payload;
            })

            // CREATE
            .addCase(createUser.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })

            // UPDATE
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.list.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
                state.selectedUser = action.payload;
            })

            // LOCK
            .addCase(lockUser.fulfilled, (state, action) => {
                const index = state.list.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })

            // UNLOCK
            .addCase(unlockUser.fulfilled, (state, action) => {
                const index = state.list.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })

            // SOFT DELETE
            .addCase(softDeleteUser.fulfilled, (state, action) => {
                state.list = state.list.filter((u) => u.id !== action.payload);
            })

            // RESTORE
            .addCase(restoreUser.fulfilled, (state, action) => {
                state.deletedList = state.deletedList.filter(
                    (u) => u.id !== action.payload.id
                );
                state.list.unshift(action.payload);
            })

            // HARD DELETE
            .addCase(hardDeleteUser.fulfilled, (state, action) => {
                state.deletedList = state.deletedList.filter(
                    (u) => u.id !== action.payload
                );
            });
    },
});

export const { clearSelectedUser, clearError } = userSlice.actions;

// Selectors
export const selectUsers = (state) => state.users.list;
export const selectDeletedUsers = (state) => state.users.deletedList;
export const selectSelectedUser = (state) => state.users.selectedUser;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;

export default userSlice.reducer;
