# SimpleAesthetic

### Elevator Pitch ###

In our online world, we spend a lot of time pointing our eyes at screens. Why don't we make them prettier? This is the idea behind **SimpleAesthetic**. **SimpleAesthetic** works to color-coordinate your digital environment. It does this in one of two ways: it generates a color theme, given an image; or given a color theme, it can convert the image to those colors. Additionally, the website provides predetermined popular color schemes to convert your images to. Image/theme pairs (*Aesthetics*) that authenticated users generate can be shared to an "explore" page, and other users with an account can upvote or downvote the themes. This allows for even those without an idea to find their forever *Aesthetic*. 

### Features ###
- Wallpaper-to-theme conversion
    - Upload an image, and watch as the website uses K-means to determine the dominant colors in the picture and return them to you as a color palette, complete with hex codes.
- Theme-to-wallpaper conversion
    - Upload an image as well as a color palette, and watch as the website tweaks the colors in your image to match the palette. 
- Explore Aesthetics
    - Go to the explore page to explore user-generated *Aesthetics*, which consist of an image/palette combination. 
- User Uploads
    - authenticated users can upload *Aesthetics* to potentially be featured on the ***Explore*** page, and upvote/downvote other *Aesthetics*. 

### Technologies ###
- Authentication:
    - simple username/password authentication will be used to allow users to upload *Aesthetics* and vote on the merit of other *Aesthetics* in the ***Explore*** tab. 
- Database data:
    - the database will store the login information of registered users as well as the *Aesthetics* that they upload. This information will be recalled to generate the ***Explore*** page.
- WebSocket Data:
    - WebSockets will be used to dynamically load *Aesthetics* to the ***Explore*** tab, and user actions such as voting will be relayed back to the server. 

### Sketch ###
![Alt text](IMG_1509.jpg)
The image above shows a (very) rough outline of the website. The idea is to keep the website very simple and intuitive. The "Generate" page centers around the image being manipulated, while the "Explore" page shows a random assortment of image/palette combinations. 

### HTML Deliverable ###
Note that any text on the pages that is enclosed in two asterisks represents a placeholder or note about future functionality. 
- HTML: I added a page to represent the three main activities: [Creating an aesthetic](index.html), [Browsing existing aesthetics](discover.html), and [Logging In](login.html). 
- Links: The header of each page includes the title of the page and links to the other pages. 
- Text: All of the options and helpful user information is included where necessary. 
- Images: There is currently a placeholder image on the create page. This image will be replaced with the user's uploaded image. There is also a placeholder palette example on the discover page. 
- Login: the [Login page](login.html) has the necessary input fields and buttons to login and create a new account.
- Database: The aesthetics shown on the [Discover page](discover.html) are stored and retrieved from the database. 
- WebSocket: The content on the [Discover page](discover.html) will be dynamically retrieved and sent over WebSocket to the client. 

### CSS Deliverable ###
- Made sticky header and footer
- Centered and adjusted website elements to make a more visually appealing experience
- Used a very minimal but consistent color scheme to focus attention on the colors being generated/manipulated
- Designed the website to look good on many different screen sizes and magnifications
- Modified a couple of HTML elements to help streamline the user experience
- Created a custom radio button style that hides the radio circle and is responsive to both hover and clicking
- Designed a "card" style from scratch that will represent an *Aesthetic* and will form the basis for the future "Discover" function

### JavaScript Deliverable ###
- Added a ton of JavaScript to implement the Aesthetic creation page
    - implemented the **Upload Image**, **Convert Image**, **Download Image**, and **Undo Changes** button event listeners.
    - implemented event listeners for each of the preloaded theme radio buttons.
        - made the function to dynamically change the palette that is displayed based on the selection 
    - implemented an event listener that creates a modal when the user selects the **Custom** theme option and makes the "select file" prompt appear
        - (created the HTML and CSS for the modal)
    - implemented an event listener to dismiss the modal
    - implemented the convertImage() function that actually modifies the pixels in the image using a Euclidean color distance formula
- Added dummy JavaScript to display the username and password when the user tries to login (actual functionality depends on database and backend)
- Added code to implement lazy loading with dummy (repeated) data in the ***Discover*** page. 
    - Added scrolling functionality and loading based on viewport location
    - added a loading card to show that another card would be coming
- Various HTML and CSS adjustments to improve UI and UX

### Service Deliverable ###
- Wrote a Node.js/Express backend that serves the frontend and provides backend endpoints
- Used static middleware to serve frontend
- Called a third-party endpoint to provide random images every time you load the page.
- Backend endpoints give placeholder data that is visible as such on the frontend. 
- Implemented calls to backend in the frontend code using the fetch API.

### DB deliverable ###
- Created a MongoDB database on Atlas
- Backend properly sends and requests data from the database for the appropriate endpoints 
- Data is properly stored and updated in the database

### Login deliverable ###
- Implemented the **Create Account** function
- Implemented the **Login** function
    - includes cryptographically-generated session tokens
    - does not include any persistent storage on the client
    - Note: for true privacy/security, encrypted passwords will be necessary in the future
- Uploaded Aesthetics are saved under the uploader's user account
    - Also implemented a title function for the uploaded aesthetics
- User accounts are saved in MongoDB
- Users can only upload Aesthetics if they are logged in