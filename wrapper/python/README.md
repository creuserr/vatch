# Vatch on Python
Vatch is now available on Python. For installation, download the [python file](vatch.py) and paste it on your project, then import `Vatch` on your project.

There is no difference or changes on methods, properties, and any other stuff. However, since python does not support self user agent, I implemented a mock user agent. The structure would look like this:

```
py: <Python Implementation> <Operating System>/<Python Version> (<Machine>-<Architecture>)

Example:
py: CPython Linux/3.11.4 (armv7l-32bit)
```

It consist of 2 special parts:

1. `py:` &mdash; constant indicator which indicates that the database is created via Python.
2. `<Architecture>` &mdash; from a joined tuple with the seperator `.`
