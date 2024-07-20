function isActiveRoute(route, currentRoute){
    return route === currentRoute ? 'active' : ''; // active is referring to header__nav ul a.active tag
}

module.exports = {isActiveRoute};