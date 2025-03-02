// This is a placeholder for the React bundle
// In a production environment, this would be replaced with the actual bundled React app

document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  
  // Create a simple homepage structure
  root.innerHTML = `
    <div class="container mt-5">
      <header class="mb-5 text-center">
        <h1 class="display-4">Premium Auto Dealership</h1>
        <p class="lead">Find your dream car today</p>
      </header>
      
      <div class="row mb-5">
        <div class="col-12">
          <div id="carouselExample" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <img src="https://via.placeholder.com/1200x400?text=Premium+Cars" class="d-block w-100" alt="Premium Cars">
              </div>
              <div class="carousel-item">
                <img src="https://via.placeholder.com/1200x400?text=Luxury+Vehicles" class="d-block w-100" alt="Luxury Vehicles">
              </div>
              <div class="carousel-item">
                <img src="https://via.placeholder.com/1200x400?text=Best+Deals" class="d-block w-100" alt="Best Deals">
              </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="row mb-4">
        <div class="col-md-6 offset-md-3">
          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Search for vehicles..." aria-label="Search for vehicles">
            <button class="btn btn-primary" type="button">Search</button>
          </div>
        </div>
      </div>
      
      <h2 class="text-center mb-4">Featured Vehicles</h2>
      
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="https://via.placeholder.com/300x200?text=Car+1" class="card-img-top" alt="Car 1">
            <div class="card-body">
              <h5 class="card-title">2023 Luxury Sedan</h5>
              <p class="card-text">A beautiful luxury sedan with all the features you need.</p>
              <p class="fw-bold">$45,000</p>
              <a href="#" class="btn btn-primary">View Details</a>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="https://via.placeholder.com/300x200?text=Car+2" class="card-img-top" alt="Car 2">
            <div class="card-body">
              <h5 class="card-title">2022 SUV</h5>
              <p class="card-text">Spacious SUV perfect for family trips and adventures.</p>
              <p class="fw-bold">$38,500</p>
              <a href="#" class="btn btn-primary">View Details</a>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="https://via.placeholder.com/300x200?text=Car+3" class="card-img-top" alt="Car 3">
            <div class="card-body">
              <h5 class="card-title">2023 Sports Car</h5>
              <p class="card-text">High-performance sports car with stunning design.</p>
              <p class="fw-bold">$65,000</p>
              <a href="#" class="btn btn-primary">View Details</a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="text-center mb-5">
        <a href="#" class="btn btn-outline-primary">View All Vehicles</a>
      </div>
      
      <footer class="py-4 bg-dark text-white text-center mt-5">
        <p>&copy; 2025 Premium Auto Dealership. All rights reserved.</p>
      </footer>
    </div>
  `;
});
