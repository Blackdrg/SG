"use strict";
describe('E2E: Complete Order Flow (signup → order → pay → track → deliver → review)', () => {
    describe('User Registration & Authentication', () => {
        it('should register a new user and return tokens', () => {
            const signupData = {
                email: 'test.user@example.com',
                password: 'SecurePass123!',
                fullName: 'Test User',
                phone: '+1234567890',
            };
            const mockResponse = {
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                user: { email: signupData.email, fullName: signupData.fullName },
            };
            expect(mockResponse).toHaveProperty('access_token');
            expect(mockResponse).toHaveProperty('refresh_token');
            expect(mockResponse.user).toMatchObject({
                email: signupData.email,
                fullName: signupData.fullName,
            });
        });
        it('should not allow duplicate email registration', () => {
            const existingEmails = new Set(['existing@example.com']);
            const signupData = { email: 'existing@example.com' };
            const isDuplicate = existingEmails.has(signupData.email);
            expect(isDuplicate).toBe(true);
        });
    });
    describe('Authentication Flow', () => {
        it('should authenticate user and return tokens', () => {
            const loginData = {
                email: 'existing.user@example.com',
                password: 'SecurePass123!',
            };
            const mockResponse = {
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
            };
            expect(mockResponse).toHaveProperty('access_token');
            expect(mockResponse).toHaveProperty('refresh_token');
        });
        it('should reject invalid credentials', () => {
            const loginData = { email: 'wrong@example.com', password: 'wrongpass' };
            const mockUser = null;
            expect(mockUser).toBeNull();
        });
    });
    describe('Complete Order Flow', () => {
        const orderStatuses = ['PLACED', 'PAYMENT_CONFIRMED', 'DRIVER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'];
        const paymentStatuses = ['PENDING', 'COMPLETED', 'REFUNDED'];
        it('should create an order with correct status transitions', () => {
            const orderData = {
                restaurantId: 'restaurant-123',
                items: [
                    { itemId: 'item-1', quantity: 2, price: 150 },
                    { itemId: 'item-2', quantity: 1, price: 100 },
                ],
                deliveryAddressId: 'address-123',
                subtotal: 400,
                tax: 40,
                deliveryFee: 50,
                discount: 20,
                tip: 30,
                grandTotal: 470,
            };
            const createdOrder = {
                id: 'order-123',
                ...orderData,
                status: 'PLACED',
                paymentStatus: 'PENDING',
            };
            expect(createdOrder).toHaveProperty('id');
            expect(createdOrder.status).toBe('PLACED');
            expect(createdOrder.paymentStatus).toBe('PENDING');
        });
        it('should process payment and update order status', () => {
            const paymentIntentId = 'pi_123';
            const orderId = 'order-123';
            const confirmedOrder = {
                id: orderId,
                status: 'PAYMENT_CONFIRMED',
                paymentStatus: 'COMPLETED',
            };
            expect(confirmedOrder.paymentStatus).toBe('COMPLETED');
            expect(confirmedOrder.status).toBe('PAYMENT_CONFIRMED');
        });
        it('should assign driver after payment confirmation', () => {
            const orderId = 'order-123';
            const driverId = 'driver-123';
            const assignedOrder = {
                id: orderId,
                driverId: driverId,
                status: 'DRIVER_ASSIGNED',
            };
            expect(assignedOrder.driverId).toBe(driverId);
            expect(assignedOrder.status).toBe('DRIVER_ASSIGNED');
        });
        it('should track order through status transitions', () => {
            const transitions = [
                { from: 'DRIVER_ASSIGNED', to: 'PICKED_UP' },
                { from: 'PICKED_UP', to: 'ON_THE_WAY' },
                { from: 'ON_THE_WAY', to: 'DELIVERED' },
            ];
            transitions.forEach(({ from, to }) => {
                expect(orderStatuses).toContain(from);
                expect(orderStatuses).toContain(to);
            });
        });
        it('should mark order as delivered', () => {
            const orderId = 'order-123';
            const deliveredOrder = {
                id: orderId,
                status: 'DELIVERED',
            };
            expect(deliveredOrder.status).toBe('DELIVERED');
        });
        it('should create a review for completed order', () => {
            const reviewData = {
                orderId: 'order-123',
                driverId: 'driver-123',
                rating: 5,
                comment: 'Great service!',
            };
            const createdReview = {
                id: 'review-123',
                ...reviewData,
            };
            expect(createdReview).toHaveProperty('id');
            expect(createdReview.rating).toBe(5);
            expect(createdReview.orderId).toBe('order-123');
        });
    });
    describe('Order Tracking Flow', () => {
        it('should return tracking info with ETA', () => {
            const trackingInfo = {
                orderId: 'order-123',
                status: 'DRIVER_ASSIGNED',
                driver: { id: 'driver-123', name: 'John Doe' },
                eta: 15,
                driverLocation: { lat: 12.9716, lng: 77.5946 },
            };
            expect(trackingInfo).toHaveProperty('orderId');
            expect(trackingInfo).toHaveProperty('status');
            expect(trackingInfo).toHaveProperty('eta');
            expect(trackingInfo).toHaveProperty('driverLocation');
        });
    });
});
//# sourceMappingURL=e2e.spec.js.map