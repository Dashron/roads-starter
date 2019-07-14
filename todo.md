# Roads-Starter: TODO
1. Move db connection out of the api constructor, and into something that can be injected
2. Maybe rethink the project idea? This feels convoluted. Maybe we can take the user routes out and into a different file, or even different package.
3. Get a roads github project set up, and maybe a roads npm org too.
4. Flush commit history and reset from a clean start to kill any old keys
5. Move csrf token stuff into core roads
6. json schema based config validation, instead of this awful hasAllKeys function