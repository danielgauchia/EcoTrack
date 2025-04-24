class Vehicle {
  constructor(creator, brand, model, year, averageConsumption, plate, type) {
    this.creator = creator;
    this.brand = brand;
    this.model = model;
    this.year = year;
    this.averageConsumption = averageConsumption;
    this.plate = plate;
    this.type = type;
    this.updatedAt = new Date().getTime();
    this.isFavorite = false;
  }

}

export default Vehicle;
