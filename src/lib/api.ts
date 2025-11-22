

const API_URL = 'http://localhost:3000/api'

export const api = {
    tutors: {
        list: async (filters?: any) => {
            const params = new URLSearchParams()
            if (filters?.subject) params.append('subject', filters.subject)
            if (filters?.location) params.append('location', filters.location)
            if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString())
            if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
            if (filters?.rating) params.append('rating', filters.rating.toString())

            const response = await fetch(`${API_URL}/tutors?${params.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch tutors')
            return response.json()
        },
        get: async (id: string) => {
            const response = await fetch(`${API_URL}/tutors/${id}`)
            if (!response.ok) throw new Error('Failed to fetch tutor details')
            return response.json()
        }
    },
    bookings: {
        create: async (bookingData: any, token: string) => {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to create booking')
            }
            return response.json()
        },
        list: async (token: string) => {
            const response = await fetch(`${API_URL}/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) throw new Error('Failed to fetch bookings')
            return response.json()
        }
    },
    reviews: {
        create: async (reviewData: any, token: string) => {
            const response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reviewData)
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to submit review')
            }
            return response.json()
        }
    }
}
