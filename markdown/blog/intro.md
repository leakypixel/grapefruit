# Initial build
The initial build will cover a purely client side app, faking server calls in
order to give an indication of the final product's utility and allow the end
client to determine if this is a commercially viable proposition. As it is a
product meant for testing, it should be robust in it's error handling and
reporting, as well as give a good indication of the final product's "feel". 

1. The home page should be a simple, static page with a hero section and space
   for client-supplied content.
2. Navigation includes login and register buttons. 
    1. Login button shows a login page, containing a login form. The username
       and password here are to be hard coded and used in client side code. This
       is only to give the test audience a feeling for how the final product
       will work and is not intended to provide any meaningful security.
    2. Register button shows a register form which is entirely non-functional.
       The user will be able to fill in fields and click the submit button,
       however there will be no effect.
3. Once "logged in", a user will be presented with a dashboard allowing them to
   create a new document or pick up a saved one. These saved documents will be
   entirely in client side localstorage. This means that the documents will not
   pass between devices, nor between browsers or clearing of web data (cookies,
   etc.).
4. Upon clicking the call to action to create a new document, the user will be
   presented with a "search" screen. This will allow the user to enter a term,
   click submit and get back a list of keywords as supplied by the google API.
    1. The keywords will be displayed on a user-selectable list as "results"
       below the search field. 
    2. Upon clicking one of the keywords, it is added to the "basket" and shows
       a selected state. Clicking the keyword again removes it from the
       "basket" and it reverts to it's original state.
5. Once a user is satisfied with their selection of keywords, they can
   submit this part of the page and be taken to the text editor.
    1. The text editor should offer common options available in word processors,
       such as making the highlighted text bold or italic. The exact options
       required here are as yet unknown, though using an off-the-shelf library
       for this purpose has been discussed. For the initial build as described
       in this document, an off-the-shelf library will be integrated and no
       modifications will be made. The option to develop a custom solution or
       modify an existing library would be available as a separate project.
    2. To the right of the text editor, the keywords selected in the previous
       part of the page should be visible in an "unchecked" or dimmed state.
    3. As text is entered into the text editor, it should highlight and "check
       off" the keywords selected in the previous form.
6. At any point the user chooses, they should be able to submit the text in the
   editor and receive an analysis.
    1. The text in the editor will be sent to another google API, which will
       provide various details on the text. 
    2. The details provided by the google analysis API should be surfaced on the
       page, below the text editor. The exact details that are to be displayed
       need to be confirmed, but anything returned by the google API is
       feasible.
    3. The user should also be presented with a save option (as described
       earlier) that should emulate saving to a server but only save to
       localstorage. 
    4. The user should, from the analysis part of the form, also be able to step
       back through "revisions". A new revision is created every time the user
       causes the analysis to be run.
7. Moving backward in the flow should always be possible, though it will change
   data further along the form. This may be a destructive action, but we will
   attempt to prevent this where possible.

