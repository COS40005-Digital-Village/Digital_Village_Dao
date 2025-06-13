# Changelog

---

### **v1.2.2 - Task Board UX and Workflow Enhancements**

- **Date:** 13 June 2025
- **Why:** The Task Board workflow needed a formal review stage, and the user experience was hindered by a lack of visual distinction between columns and no immediate feedback after user actions.
- **What:**
    - Introduced a new "In Review" column to the Task Board.
    - Added distinct background colors for "In Progress" (light blue), "In Review" (light yellow), and "Done" (light green) columns.
    - Implemented a toast notification system for all major task-related actions.
- **How:**
    1.  **"In Review" Column:** Modified the `initialTaskBoardData` object in `components/tasks/TaskBoardPage.tsx` by adding a new column object for "In Review" and updating the `columnOrder` array to position it correctly.
    2.  **Column Styling:** Created a `getColumnBackgroundColor` helper function to return appropriate Tailwind CSS classes based on column titles and applied these classes dynamically to each column's container.
    3.  **Toast Notifications:** Installed the `sonner` library. Added the global `<Toaster />` provider to `dao-wireframe.tsx`. Imported and called the `toast()` function with appropriate messages (`toast.success`, `toast.info`, `toast.error`) as a side effect after state was updated in the relevant handler functions (`handleAddTask`, `handleSaveTaskDetails`, `onDrop`, etc.) within `TaskBoardPage.tsx`.

---

### **v1.2.1 - Build System and Dependency Patch**

- **Date:** 13 June 2025
- **Why:** The local `npm` environment was corrupted, which prevented the installation of new packages due to cryptic `Cannot read properties of null (reading 'matches')` errors and underlying peer dependency conflicts.
- **What:** Repaired the `npm` dependency tree and the package installation process.
- **How:** Executed a sequence of commands to ensure a clean build environment:
    1.  Forced a clean of the `npm` cache (`npm cache clean --force`).
    2.  Removed the existing `node_modules` directory and the `package-lock.json` file.
    3.  Reinstalled all project dependencies using the `--legacy-peer-deps` flag to bypass a non-critical peer dependency conflict between `react-day-picker` and `date-fns`. This stabilized the environment for future package installations.

---
