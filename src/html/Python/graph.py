from flask import Flask, render_template, redirect, request, url_for
app = Flask(__name__)
 
@app.route('/')
@app.route('/<int:num>')
def inputTest(num=None):
    return render_template('main.html', num=num)
    
if __name__ == '__main__':
    app.run()
