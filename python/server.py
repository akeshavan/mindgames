from flask import Flask, render_template, request
from werkzeug import secure_filename
from generate_tiles import create_tiles
import os

app = Flask(__name__)
# Got from https://www.tutorialspoint.com/flask/flask_file_uploading.htm

@app.route('/upload')
def upload_file():
   return render_template('upload.html')

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_poo():
   if request.method == 'POST':
      f = request.files['file']
      print("hello!!!")
      fname = secure_filename(f.filename)
      f.save(fname)
      return 'file uploaded successfully'

if __name__ == '__main__':
   #app.config['UPLOAD_FOLDER'] = "uploads/"

   #if not os.path.exists(app.config['UPLOAD_FOLDER']):
   #    os.makedirs(app.config['UPLOAD_FOLDER'])

   app.run(debug = True)
