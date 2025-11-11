from django.test import TestCase

class HelloWorldTestCase(TestCase):
	def test_hello_world(self):
		response = self.client.get('/api/hello')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json(), {'message': 'Hello, World!'})