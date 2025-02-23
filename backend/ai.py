import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, regularizers
import matplotlib.pyplot as plt
import numpy as np
import os
from tensorflow.keras.preprocessing.image import ImageDataGenerator


# Set parameters
image_size = (224, 224)
dataset_path = "./ml/drinks-combined"
model_path = "./ml/drinks_bottle_classifier-m6.keras"
batch_size = 32

# Training generator with augmentation (no rescaling)
train_datagen = ImageDataGenerator(
    validation_split=0.2,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    brightness_range=[0.8, 1.2]
)

# Validation generator without augmentation (no rescaling)
val_datagen = ImageDataGenerator(
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    dataset_path,
    target_size=image_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='training'
)

val_generator = val_datagen.flow_from_directory(
    dataset_path,
    target_size=image_size,
    batch_size=batch_size,
    class_mode='categorical',
    subset='validation'
)

# Custom callback to plot training and validation accuracy after each epoch


class AccuracyPlotCallback(keras.callbacks.Callback):
    def __init__(self, output_file="accuracy_plot.png"):
        super().__init__()
        self.history_acc = []
        self.history_val_acc = []
        self.output_file = output_file

    def on_epoch_end(self, epoch, logs=None):
        self.history_acc.append(logs.get('accuracy'))
        self.history_val_acc.append(logs.get('val_accuracy'))
        print(
            f"Epoch {epoch+1} - Accuracy: {self.history_acc[-1]:.4f}, Val Accuracy: {self.history_val_acc[-1]:.4f}")
        plt.figure()
        plt.plot(self.history_acc, label='accuracy', color='blue')
        plt.plot(self.history_val_acc, label='val_accuracy', color='orange')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
        plt.savefig(self.output_file)
        plt.close()

    def on_train_end(self, logs=None):
        plt.figure()
        plt.plot(self.history_acc, label='accuracy', color='blue')
        plt.plot(self.history_val_acc, label='val_accuracy', color='orange')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
        plt.savefig(self.output_file)
        plt.close()

# Define a model using pre-trained MobileNetV2


def create_model():
    # Load the MobileNetV2 model with pre-trained ImageNet weights
    base_model = keras.applications.MobileNetV2(
        input_shape=(image_size[0], image_size[1], 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Freeze the pre-trained layers

    inputs = keras.Input(shape=(image_size[0], image_size[1], 3))
    # Apply MobileNetV2 preprocessing to convert [0,255] to [-1,1]
    x = keras.applications.mobilenet_v2.preprocess_input(inputs)
    x = base_model(x, training=False)
    x = keras.layers.GlobalAveragePooling2D()(x)
    x = keras.layers.Dropout(0.5)(x)
    outputs = keras.layers.Dense(
        len(train_generator.class_indices), activation='softmax')(x)
    model = keras.Model(inputs, outputs)
    return model


def learn(epochs=30,path=None):
    model = create_model()
    model.compile(optimizer='adam',
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])

    lr_scheduler = keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss', patience=3, factor=0.5)
    early_stopping = keras.callbacks.EarlyStopping(
        monitor='val_loss', patience=5, restore_best_weights=True)
    acc_plot_callback = AccuracyPlotCallback(
        output_file="./plots/accuracy_plot.png")
    os.makedirs("./plots", exist_ok=True)

    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=epochs,
        callbacks=[lr_scheduler, early_stopping, acc_plot_callback]
    )
    model.save(model_path if path is None else path)
    return model


def predict_image(image_path, model):
    from tensorflow.keras.preprocessing import image
    img = image.load_img(image_path, target_size=image_size)
    img_array = image.img_to_array(img)
    # No rescaling here: MobileNetV2 preprocesses input in the model
    img_array = np.expand_dims(img_array, axis=0)
    predictions = model.predict(img_array)[0]

    top_4_indices = np.argsort(predictions)[-4:][::-1]

    top_4_labels = [list(train_generator.class_indices.keys())[i]
                    for i in top_4_indices]
    top_4_probs = [predictions[i] for i in top_4_indices]
    return list(zip(top_4_labels, top_4_probs))


model = None
# model = learn(30)


def learn_and_set(epochs=30):
    global model
    new_model = learn(epochs=epochs)
    model = new_model

learn_ai = os.environ.get("AI_LEARN") == "true" if os.environ.get(
    "AI_LEARN") else False

if learn_ai:
    learn(path=input("Model output path:")+"/drinks_bottle_classifier-m6.keras")

if model is None:
    model = keras.models.load_model(model_path)


def predict_jpg(filename):
    return predict_image(filename, model)
