package main

import "os"

func createDirs() {
	dirs := []string{"uploads", "outputs", "temp"}
	for _, dir := range dirs {
		_ = os.MkdirAll(dir, 0755)
	}
}
