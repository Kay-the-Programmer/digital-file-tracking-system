# Digital File and Case Tracking System (DFTS)

This project is a comprehensive web application designed to manage digital and physical files, track cases through customizable workflows, and handle complex organizational structures. It provides a robust role-based access control system to ensure data security and integrity within an organization.

## ✨ Features

*   **👤 User & Role Management:** Create, update, and manage users and their roles with a granular, permission-based access control system.
*   **📂 Case Management:** Initiate, track, and manage cases (e.g., Fund Requests, Leave Approvals) with associated files, custom attributes, and statuses.
*   **🗂️ File Management:** Handle both digital files (with versioning) and physical files, including tracking their location and movement history.
*   **⚙️ Dynamic Workflow Engine:** Define custom workflow templates for different case types to automate processes, reviews, and approvals across various departments and roles.
*   **🏢 Organizational Structure:** Model complex organizational hierarchies, from top-level ministries down to individual departments and units.
*   **📊 Dashboard & Analytics:** (Planned) A central dashboard to visualize Key Performance Indicators (KPIs) and view recent system activity.

## 🚀 Tech Stack

*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Framework:** [React 19](https://react.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Routing:** [React Router](https://reactrouter.com/)
*   **Package Manager:** [npm](https://www.npmjs.com/)

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18 or higher) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd <project-directory>
    ```
3.  **Install the dependencies:**
    ```sh
    npm install
    ```

### Running the Application

To run the application in development mode:

```sh
npm run dev
```