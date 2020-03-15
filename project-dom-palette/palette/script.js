console.log('Hell to world!')
let currentTool = "choose-color";
let classname = document.getElementsByClassName("menu-item");
let currentColor = "green";
console.log(classname[0].parentElement.className.includes("tool"));


Array.from(document.getElementsByClassName("menu-item"))
    .filter((element) => { return element.parentElement.className.includes("tool") })
    .forEach((element) => {
        element.addEventListener('click', (event) => {
            // console.log('handler ', event.currentTarget);
            // console.log('place ', event.target);
            currentTool = event.currentTarget.id;
        })
    });

Array.from(document.getElementsByClassName("menu-item"))
    .filter((element) => { return element.parentElement.className.includes("palette") })
    .forEach((element) => {
        element.addEventListener('click', (event) => {
            console.log(currentTool);
            if (currentTool == "choose-color") {
                const color = () => {
                    return Array.from(event.currentTarget.children)
                        .filter(element => element.className.includes("logo"))[0].style.backgroundColor;
                };
                console.log('color', color());
                document.getElementById('previous-color').style.backgroundColor = currentColor;
                currentColor = color();q
                document.getElementById('current-color').style.backgroundColor = currentColor;
            }
        })
    });

Array.from(document.getElementsByClassName("data"))
    .forEach((element) => {
        element.addEventListener('click', (event) => {
            console.log('target ->  ', event);
            if (currentTool == "paint-bucket") {
                event.target.style.backgroundColor = currentColor;
            } else if (currentTool == "transform") {
                if (event.target.style.borderRadius) {
                    event.target.style.borderRadius = "";
                } else {
                    event.target.style.borderRadius = "50%";
                }
            }
        });

        element.addEventListener('dragstart', (event) => {
            console.log('currentTool -> ', currentTool);
            console.log('currentColor -> ', currentColor);
            console.log('target ->  ', event);
            event.dataTransfer.setData("text", event.target.id);
            if (currentTool == "move") {
            }
        })
    });

Array.from(document.getElementsByClassName("data-place"))
    .forEach((element) => {
        element.addEventListener('drop', (event) => {
            console.log('event.dataTransfer ->  ', event.dataTransfer);
            event.preventDefault();
            var data = event.dataTransfer.getData("text");
            event.target.appendChild(document.getElementById(data));
        });
        element.addEventListener('dragover', (event) => {
            console.log('target ->  ', event);
            event.preventDefault();
        })
    });