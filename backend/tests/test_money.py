import unittest

import util


class MoneyHelperTests(unittest.TestCase):
    def test_euro_to_cents_rounds_legacy_values(self):
        self.assertEqual(util.euro_to_cents("1.23"), 123)
        self.assertEqual(util.euro_to_cents("-0.01"), -1)
        self.assertEqual(util.euro_to_cents(0.1 + 0.2), 30)
        self.assertEqual(util.euro_to_cents("1.235"), 124)

    def test_parse_cents_requires_integer_cents(self):
        self.assertEqual(util.parse_cents(123), 123)
        self.assertEqual(util.parse_cents("123"), 123)
        self.assertEqual(util.parse_cents("123.0"), 123)

        with self.assertRaises(ValueError):
            util.parse_cents("1.23")

        with self.assertRaises(ValueError):
            util.parse_cents(1.5)

    def test_format_cents(self):
        self.assertEqual(util.format_cents(123), "1.23")
        self.assertEqual(util.format_cents(-1), "-0.01")
        self.assertEqual(util.format_cents(1200, decimal_separator=","), "12,00")


if __name__ == "__main__":
    unittest.main()
