import serial
import pymongo
from datetime import datetime

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["LEODB"]
collection = db["SensorData"]
ser = serial.Serial('COM8', 115200) 

def store_data_in_mongo(data):
    """Function to store sensor data in MongoDB"""
    sensor_data = {
        "accX": data[0],
        "accY": data[1],
        "accZ": data[2],
        "gyroX": data[3],
        "gyroY": data[4],
        "gyroZ": data[5],
        "temp": data[6],
        "hum": data[7],
        "lat": data[8],
        "lon": data[9],
        "current": data[10],
        "timestamp": datetime.now()
    }
    collection.insert_one(sensor_data)
    print(f"Data inserted into MongoDB: {sensor_data}")

def process_serial_data(line):
    """Function to process the raw serial data and store it in MongoDB"""
    try:
        data = line.split(',')
        if len(data) == 11:
            data = [float(i) for i in data]
            store_data_in_mongo(data)
        else:
            print(f"Invalid data format received: {line}")
    except ValueError as e:
        print(f"Error processing data: {e}. Received: {line}")
        
    
while True:
    try:
        raw_line = ser.readline()
        line = raw_line.decode('utf-8', errors='ignore').strip()
        process_serial_data(line)
    except Exception as e:
        print(f"Unexpected error: {e}")
