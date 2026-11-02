package profile

import (
	"testing"
	"time"
)

func TestAgeChangesOnBirthdayInJapanTime(t *testing.T) {
	tests := []struct {
		name string
		now  time.Time
		want int
	}{
		{"誕生日の前日(日本時間 23:59)", time.Date(2026, 11, 30, 23, 59, 0, 0, Tokyo), 22},
		{"誕生日の当日(日本時間 0:00)", time.Date(2026, 12, 1, 0, 0, 0, 0, Tokyo), 23},
		// UTC では 11/30 15:00 だが、日本ではもう誕生日
		{"UTC ではまだ前日でも日本では当日", time.Date(2026, 11, 30, 15, 0, 0, 0, time.UTC), 23},
		{"うるう年の2月29日", time.Date(2028, 2, 29, 12, 0, 0, 0, Tokyo), 24},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := Age(Birthday, tt.now); got != tt.want {
				t.Errorf("Age(%v) = %d, want %d", tt.now, got, tt.want)
			}
		})
	}
}

func TestCardFactsStartsWithAge(t *testing.T) {
	facts := CardFacts(time.Date(2026, 10, 23, 12, 0, 0, 0, Tokyo))
	if facts[0].Key != "age" || facts[0].Value != "22" {
		t.Errorf("facts[0] = %+v, want age 22", facts[0])
	}
}
