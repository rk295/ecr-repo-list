package main

import (
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ecr"
	"github.com/gin-gonic/gin"
)

type repositoryList struct {
	Repositories []ecr.Repository
}

type imageList struct {
	ImageDetails []ecr.ImageDetail
}

var region = "eu-west-1"

func main() {

	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	v1 := r.Group("/api/v1.0")
	{
		v1.GET("/:registryID/repositories", getRepoList)
		v1.GET("/:registryID/repository/:repositoryName", getContainterList)
	}

	// Serve the files for the UI ourselves
	r.StaticFile("/", "./static/index.html")
	r.StaticFile("/favicon.ico", "./static/assets/favicon.ico")
	r.Static("/static", "./static")

	r.Run() // listen and serve on 0.0.0.0:8080

}

func getRepoList(c *gin.Context) {

	registryID := c.Param("registryID") // Pull the registry ID from the URI

	repositoryList := repositoryList{Repositories: getRepositories(registryID, region)}
	c.JSON(http.StatusOK, repositoryList)
}

func getContainterList(c *gin.Context) {
	registryID := c.Param("registryID")
	repositoryName := c.Param("repositoryName")

	imageList := imageList{ImageDetails: listRepository(registryID, repositoryName, region)}
	c.JSON(http.StatusOK, imageList)

}

func getRepositories(registryID string, region string) []ecr.Repository {

	sess := session.Must(session.NewSession())
	ecrSvc := ecr.New(sess, aws.NewConfig().WithRegion(region))

	input := &ecr.DescribeRepositoriesInput{
		RegistryId: aws.String(registryID),
	}

	var allRepositories []ecr.Repository

	err := ecrSvc.DescribeRepositoriesPages(input,
		func(page *ecr.DescribeRepositoriesOutput, lastPage bool) bool {

			for _, element := range page.Repositories {
				allRepositories = append(allRepositories, *element)
			}

			if page.NextToken == nil {
				return false
			}
			return true
		})

	if err != nil {
		fmt.Println("Error", err)
	}

	return allRepositories

}

func listRepository(registryID string, repositoryName string, region string) []ecr.ImageDetail {

	sess := session.Must(session.NewSession())
	ecrSvc := ecr.New(sess, aws.NewConfig().WithRegion(region))

	input := &ecr.DescribeImagesInput{
		RegistryId:     aws.String(registryID),
		RepositoryName: aws.String(repositoryName),
	}

	var allImages []ecr.ImageDetail

	err := ecrSvc.DescribeImagesPages(input,
		func(page *ecr.DescribeImagesOutput, lastPage bool) bool {

			for _, element := range page.ImageDetails {
				allImages = append(allImages, *element)
			}

			if page.NextToken == nil {
				return false
			}
			return true

		})

	if err != nil {
		fmt.Println("Error", err)
	}

	return allImages
}
