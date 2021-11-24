$(document).ready(function(){
    new ClipboardJS('.btn');
    // Get the main repo list JSON
    $.get('/api/v1.0/' + registryID + '/repositories', process_repositories);

});

function process_repositories(data, status){

    $.get('static/templates/index.mst', function(template) {

        var compiledTemplate = Handlebars.compile(template);

        // Add this field to the data so we can display it in the template
        numberOfRepos = data['repositories'].length;
        data['numberOfRepos'] = numberOfRepos;

        // Sorting here means the template doesn't need special handlers
        data['repositories'].sort(function(a, b){
            return a.repositoryName.localeCompare(b.repositoryName);
        });
        $('#target').append(compiledTemplate(data));

        // If there is a hash in the location, handle that
        if (location.hash){
            // Remove the #
            var requested_hash = location.hash.slice(1);
            selectedRepo=decodeURIComponent(requested_hash);

            // Get the element, it may contain slashes, so this method is
            // used rather than $(#...).
            targetElement = document.getElementById('details-' + selectedRepo);
            // Add the bootstrap 'show' class to the element.
            $(targetElement).addClass("show");
            // Fire off a request to fetch 'this' repos images
            get_repo_details(targetElement.getAttribute("data-repoName"));
            
            location.hash = '';
            location.hash = requested_hash;
        }

        // Handle the expand card event
        $("[id^=details]").on('show.bs.collapse', function (event) {
            var repo_name = event.target.getAttribute("data-repoName");
            window.location.hash = encodeURIComponent(event.target.id.replaceAll("details-", ""));
            get_repo_details(repo_name);
        });
    });
}

// Called when a card is expanded
function get_repo_details(repo_name){
    file_name = '/api/v1.0/' + registryID + '/repository/' + repo_name;
    $.get(file_name, process_repo_details);
}

function process_repo_details(data, status){
    repo_name = this.url.replace(/.*repository\//, "");
    safe_repo_name = repo_name.replaceAll("/", "-").replaceAll(".", "-");

    $.get('static/templates/repo-list.mst', function(template) {
        var compiledTemplate = Handlebars.compile(template);

        numberOfContainers = data['imageDetails'].length;


        var totalSizeBytes=0;
        data['imageDetails'].forEach(function total(item) {
            totalSizeBytes += item['imageSizeInBytes'];
        });

        totalSize = humanFileSize(totalSizeBytes, false);
        $('#imageCountTable-' + safe_repo_name).html(numberOfContainers);
        $('#imageSizeTable-' + safe_repo_name).html(totalSize);
        $('#imageCountBadge-' + safe_repo_name).html(numberOfContainers);
        $('#imageSizeBadge-' + safe_repo_name).html(totalSize);

        data['imageDetails'].sort(function(a, b){
            return parseFloat(b.imagePushedAt) - parseFloat(a   .imagePushedAt);
        });

        $('#repolist-' + safe_repo_name).html(compiledTemplate(data));
    });
}

function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}
