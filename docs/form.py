import cgi
form = cgi.FieldStorage()

name = form.getvalue('age')
email = form.getvalue('sex')
background = form.getvalue('background')

print(name)
print(email)
print(background)