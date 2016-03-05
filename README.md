User Story: I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.


User Story: If I pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain an error instead.


User Story: When I visit that shortened URL, it will redirect me to my original link.



STEPS:

1) Go to http://site/create/[insert forwarding address here]

   Example:  http://site/create/http://www.google.com
   

2) You will receive a JSON response telling you the shortcut address

   Example:  '{"orininal_url":"http://www.google.com","short_url":"http://freecodecamp-safari137.c9users.io/0" }'
   

3) You man now visit http://freecodecamp-safari137.c9users.io/0 and it will forward you to http://www.google.com 