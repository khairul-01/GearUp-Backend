# GearUP Backend 
This is GearUp, a backend REST API for a sports and outdoor equipment rental platform.   
This project is build using Node.js, Express, TypeScript, PostgresSQL, Prisma ORM, JWT Authentication, and Stripe Checkout.  

The system supports three different user roles:   
* Customer
* Provider
* Admin     
Each role has different permissions and is protected using role-based authorization.   

***The Project Live Link: *** ***https://gear-up-backend-jet.vercel.app***

### Project architecture
This project follows a modular architecture.  
Each feature is organized into its own module containing routes, controllers, services, validations, and interfaces.   
The request flow is:   
Client -> Route -> Validation middleware -> Controller -> Service -> Prisma ORM -> PostgresSQL Database.   

For security, JWT Authentication, authorization middleware, Zod validation, and global error handler has been implemented.

### Customer Role
After register as Customer and login, customer will get a JWT access token. Using this token the customer can
* Browse all available gear
* View gear details
* Create a rental order
* Create a Stripe Checkout session for payment
* view rental history
* View payment history
* Submit a review after returning equipment   
If a customer try to access a Provider or Admin endpoint, the APIs returns a Forbidden response because the customer does not have permission.

### Provider Role
After login as a Provider.    
The provider can:  
* Add a new gear item
* update gear information
* Delete gear
* View incoming rental orders
* Update rental order status such as Confirmed, Picked Up, and Returned   

The provider cannot access any Admin endpoints because of role-based authorization.

### Admin Role
After login as a Admin, the Admin has full control over the systems.   
The Admin can:
* Create gear category
* View all users
* Suspend or active users
* View all gear listings
* View all rental orders  

These endpoint are accessible only by Admin role.

### CRUD Operations
Create, Read, Update and Delete operations function in this project

### Validation and Error Handling
JWT Authentication, authorization, input validation by Zod, noFound and global error handling middleware has been implemented.

### Technical Challenge
One technical challenge I faced was integrating Stripe Checkout with the rental workflow.   
After completing the payment, I needed to verify the payment using Stipe Webhooks and update both the payment and RentalOrders tables automatically.  
Another challenge was implementing role-based authorization together with reusable middleware and request validation while keeping the project modular and maintainable.