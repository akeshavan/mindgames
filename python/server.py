from flask import Flask, render_template, request
from werkzeug import secure_filename
from generate_tiles import create_tiles
import os
from generate_tiles import create_tiles

app = Flask(__name__)
# Got from https://www.tutorialspoint.com/flask/flask_file_uploading.htm

@app.route('/upload')
def upload_file():
   return render_template('upload.html')

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_function():
   if request.method == 'POST':
      f_image = request.files['image_file']
      f_mask = request.files['mask_file']
      print("hello!!!")
      fname_image, ext_image = os.path.splitext(secure_filename(f_image.filename))
      fname_mask, ext_mask = os.path.splitext(secure_filename(f_mask.filename))
      f_image.save('uploaded_files/'+fname_image+'_image'+ext_image)
      f_mask.save('uploaded_files/'+fname_mask+'_mask'+ext_mask)

      slice_direction = request.form['slice_direction']
      task_type = request.form['task_type']
      min_Nvox = request.form['min_Nvox']
      print(slice_direction, task_type, min_Nvox)
      if len(fname_image) > 0 and len(fname_mask) >0:
          return 'file uploaded successfully'
      else:
          return "UHOH: please upload a valid file"
      generate_tiles

if __name__ == '__main__':
   #app.config['UPLOAD_FOLDER'] = "uploads/"

   #if not os.path.exists(app.config['UPLOAD_FOLDER']):
   #    os.makedirs(app.config['UPLOAD_FOLDER'])

   app.run(debug = True)
