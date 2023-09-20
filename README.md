# startup

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
See sketch.pdf in repo