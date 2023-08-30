# Author
Matan Toledano

If you have any questions or encounter any issues with this project, feel free to contact me at matantoled@gmail.com. I'll be more than happy to help!

# Social Photo Display with NASA APOD
![image](https://github.com/matantoled/NASA-Book/assets/75612523/27d8663e-8394-45ec-a8ed-294134a7c644)

This project aims to build a SPA (Single Page Application) that showcases daily space images from NASA and provides an interface for users to comment on these images. It integrates with the NASA REST API for fetching the images and a custom-built Express.js REST API for comment management.

## Features

### Frontend
- **User Authentication**: Prompt users to enter a username (24 letters [a-z] or numbers max) before accessing the main content.
- **Image Browsing**: Enables users to view images from NASA's "Astronomy Picture of the Day" up to a specific date.
- **Commenting Interface**: Offers users the ability to add comments to images (up to 128 characters) and delete their own comments based on their username.
- **Infinite Scrolling**: Provides an option for infinite scrolling or a "more" button to display additional images.

![image](https://github.com/matantoled/NASA-Book/assets/75612523/f8ca6690-97d3-4d13-b8fa-ee802fe563fb)


### Backend
- **REST API**: Custom-built using Express.js, facilitates frontend and backend communication.
- **Comment Management**: Stores comments and their associated data (image identifier, username, etc.) in memory.
- **NASA API Integration**: Connects with the NASA API, specifically the APOD (Astronomy Picture of the Day) section, to fetch daily space images.

## Real-time Comment Synchronization via Polling

One of the standout features of this project is the implementation of a real-time comment synchronization mechanism using polling. Every 15 seconds, the frontend client automatically fetches the latest comments for the currently displayed image. This means that if another user, perhaps from a different browser or device, adds or deletes a comment to the same image, you will be able to see that comment on your screen within a maximum time frame of 15 seconds.

![image](https://github.com/matantoled/NASA-Book/assets/75612523/935cf37f-e8ce-4f94-9c13-93fb367580e2)

### Why is this significant?

1. **User Experience**: It enhances the user experience by ensuring that the comments section is always up-to-date, allowing users to engage in real-time discussions about the images.
2. **Technical Complexity**: Implementing a polling mechanism requires careful consideration of server load and performance. Fetching data too frequently could strain the server, while infrequent updates could diminish the real-time feel.
3. **Consistency**: Ensuring data consistency across multiple clients is a challenging task. The 15-second polling interval strikes a balance between real-time updates and server performance.
image

## Getting Started

### Prerequisites
Ensure you have Node.js installed on your system.

### Initializing the Backend
1. Navigate to the project directory.
2. Install the required packages:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

### Accessing the Frontend
Open your preferred web browser and navigate to the address where the server is running (http://localhost:3000).

## How to Use
1. Begin by entering your username to access the main content.
2. Browse through the displayed space images.
3. Add comments to your preferred images and manage your existing comments.

## Acknowledgments
- Special thanks to my partner, Yitzhak Halevi, for his significant contributions to this project.
- Gratitude to the course and the provided guidelines for framing the project's objectives and requirements.
